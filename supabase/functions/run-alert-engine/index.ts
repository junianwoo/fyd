import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { buildEmail, getCard, getPhoneButton, ALERT_EMAIL_OPTIONS } from "../_shared/email-templates.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RUN-ALERT-ENGINE] ${step}${detailsStr}`);
};

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Note: City coordinates are now stored in the database with each alert_setting
// via Google Geocoding API when the user adds a location. This provides
// accurate coordinates for both postal codes and city names.

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Alert engine started");

    const { clinicId } = await req.json();
    
    if (!clinicId) {
      throw new Error("Missing clinicId");
    }

    // Get clinic details
    const { data: clinic, error: clinicError } = await supabaseClient
      .from("clinics")
      .select("*")
      .eq("id", clinicId)
      .single();

    if (clinicError || !clinic) {
      throw new Error(`Clinic not found: ${clinicError?.message}`);
    }

    logStep("Clinic found", { 
      name: clinic.name, 
      status: clinic.accepting_status,
      city: clinic.city 
    });

    // Only send alerts if clinic is accepting
    if (clinic.accepting_status !== "accepting") {
      logStep("Clinic not accepting, skipping alerts");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Clinic not accepting, no alerts sent",
        alertsSent: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get all active subscribers with alert settings
    const { data: subscribers, error: subscribersError } = await supabaseClient
      .from("profiles")
      .select(`
        user_id,
        email,
        status
      `)
      .in("status", ["alert_service", "assisted_access"]);

    if (subscribersError) {
      throw new Error(`Error fetching subscribers: ${subscribersError.message}`);
    }

    logStep("Found subscribers", { count: subscribers?.length || 0 });

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No active subscribers",
        alertsSent: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    let alertsSent = 0;
    const siteUrl = Deno.env.get("SITE_URL") || "https://findyourdoctor.ca";

    // Process each subscriber
    for (const subscriber of subscribers) {
      // Get alert settings for this subscriber
      const { data: alertSettings, error: alertError } = await supabaseClient
        .from("alert_settings")
        .select("*")
        .eq("user_id", subscriber.user_id)
        .eq("is_active", true);

      if (alertError || !alertSettings || alertSettings.length === 0) {
        continue;
      }

      // Check if doctor is within any of the subscriber's alert locations
      for (const alert of alertSettings) {
        // Use stored coordinates from database (set during alert creation via geocoding)
        if (!alert.latitude || !alert.longitude) {
          logStep('Alert missing coordinates, skipping', { 
            alertId: alert.id,
            cityPostal: alert.city_postal 
          });
          continue;
        }

        const distance = calculateDistance(
          alert.latitude,
          alert.longitude,
          Number(clinic.latitude),
          Number(clinic.longitude)
        );

        const radiusKm = alert.radius_km || 25;

        if (distance <= radiusKm) {
          logStep("Match found", { 
            subscriberEmail: subscriber.email, 
            alertCity: alert.city_postal,
            distance: Math.round(distance),
            radius: radiusKm
          });

          // Check if user wants to apply filters
          if (alert.apply_filters) {
            let filterMatch = true;
            
            // Language filter: clinic must have at least one of user's languages
            if (alert.languages && alert.languages.length > 0) {
              const clinicLanguages = clinic.languages || [];
              const hasMatchingLanguage = alert.languages.some((lang: string) => 
                clinicLanguages.includes(lang)
              );
              if (!hasMatchingLanguage) {
                filterMatch = false;
                logStep("Language filter mismatch", {
                  clinicLanguages,
                  userLanguages: alert.languages
                });
              }
            }
            
            // Accessibility filters
            if (filterMatch && alert.wheelchair_accessible) {
              const clinicAccessibility = clinic.accessibility_features || [];
              if (!clinicAccessibility.includes('Wheelchair Accessible')) {
                filterMatch = false;
                logStep("Wheelchair accessibility filter mismatch");
              }
            }
            
            if (filterMatch && alert.accessible_parking) {
              const clinicAccessibility = clinic.accessibility_features || [];
              if (!clinicAccessibility.includes('Accessible Parking')) {
                filterMatch = false;
                logStep("Accessible parking filter mismatch");
              }
            }
            
            // Skip this alert if filters don't match
            if (!filterMatch) {
              logStep("Clinic doesn't match user's filters, skipping", {
                clinicId: clinic.id,
                alertId: alert.id
              });
              continue;
            }
          }

          // Send alert email
          try {
            // Build email body content
            const clinicCard = getCard(`
              <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 22px; font-family: Georgia, 'Times New Roman', serif;">${clinic.name}</h2>
              
              <div style="margin-bottom: 20px;">
                <p style="margin: 0 0 4px 0; font-size: 15px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  📍 ${clinic.address}, ${clinic.city}, ${clinic.province} ${clinic.postal_code}
                </p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #00A6A6; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  📏 ~${Math.round(distance)} km from ${alert.city_postal}
                </p>
              </div>
              
              ${getPhoneButton(clinic.phone, clinic.phone)}
              
              <div style="margin-top: 16px;">
                <a href="${siteUrl}/clinics/${clinic.id}" style="color: #00A6A6; font-size: 14px; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  View Full Details →
                </a>
              </div>
            `, '#2ECC71');
            
            const bodyContent = `
              ${clinicCard}
              
              <div style="background: #FEF3C7; border-left: 4px solid #F4A261; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0; font-size: 15px; color: #92400E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  <strong>⚡ Act fast!</strong> Clinics fill up quickly. We recommend calling as soon as possible to secure your spot.
                </p>
              </div>
              
              <p style="margin: 16px 0 0 0; font-size: 13px; color: #999; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                You're receiving this because you have alerts set for ${alert.city_postal}.
              </p>
            `;
            
            const html = buildEmail({
              headerTitle: '🎉 Great News!',
              headerSubtitle: `A clinic near ${alert.city_postal} is now accepting patients`,
              bodyContent,
              siteUrl,
              includeUnsubscribe: true,
            });
            
            await resend.emails.send({
              from: ALERT_EMAIL_OPTIONS.from!,
              reply_to: ALERT_EMAIL_OPTIONS.replyTo!,
              to: [subscriber.email],
              subject: `🎉 Family Doctor Alert: ${clinic.name} is now accepting patients in ${clinic.city}!`,
              html,
            });
            
            alertsSent++;
            logStep("Alert email sent", { to: subscriber.email });
          } catch (emailError: any) {
            logStep("Error sending email", { 
              to: subscriber.email, 
              error: emailError.message 
            });
          }

          // Only send one alert per subscriber per clinic
          break;
        }
      }
    }

    logStep("Alert engine completed", { alertsSent });

    return new Response(JSON.stringify({ 
      success: true, 
      alertsSent,
      clinicId,
      clinicName: clinic.name
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

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

// Simple geocoding using city names (fallback coordinates for major Ontario cities)
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "toronto": { lat: 43.6532, lng: -79.3832 },
  "ottawa": { lat: 45.4215, lng: -75.6972 },
  "mississauga": { lat: 43.5890, lng: -79.6441 },
  "brampton": { lat: 43.7315, lng: -79.7624 },
  "hamilton": { lat: 43.2557, lng: -79.8711 },
  "london": { lat: 42.9849, lng: -81.2453 },
  "markham": { lat: 43.8561, lng: -79.3370 },
  "vaughan": { lat: 43.8563, lng: -79.5085 },
  "kitchener": { lat: 43.4516, lng: -80.4925 },
  "windsor": { lat: 42.3149, lng: -83.0364 },
  "richmond hill": { lat: 43.8828, lng: -79.4403 },
  "oakville": { lat: 43.4675, lng: -79.6877 },
  "burlington": { lat: 43.3255, lng: -79.7990 },
  "sudbury": { lat: 46.4917, lng: -80.9930 },
  "oshawa": { lat: 43.8971, lng: -78.8658 },
  "barrie": { lat: 44.3894, lng: -79.6903 },
  "kingston": { lat: 44.2312, lng: -76.4860 },
  "guelph": { lat: 43.5448, lng: -80.2482 },
  "cambridge": { lat: 43.3616, lng: -80.3144 },
  "waterloo": { lat: 43.4643, lng: -80.5204 },
  "thunder bay": { lat: 48.3809, lng: -89.2477 },
  "st. catharines": { lat: 43.1594, lng: -79.2469 },
  "niagara falls": { lat: 43.0896, lng: -79.0849 },
  "peterborough": { lat: 44.3091, lng: -78.3197 },
  "ajax": { lat: 43.8509, lng: -79.0204 },
  "whitby": { lat: 43.8975, lng: -78.9429 },
  "newmarket": { lat: 44.0592, lng: -79.4614 },
  "scarborough": { lat: 43.7731, lng: -79.2576 },
  "north york": { lat: 43.7615, lng: -79.4111 },
  "etobicoke": { lat: 43.6205, lng: -79.5132 },
};

function getCityCoordinates(cityPostal: string): { lat: number; lng: number } | null {
  const normalized = cityPostal.toLowerCase().trim();
  
  // Check direct city match
  if (CITY_COORDINATES[normalized]) {
    return CITY_COORDINATES[normalized];
  }
  
  // Check if any city name is contained in the input
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (normalized.includes(city) || city.includes(normalized)) {
      return coords;
    }
  }
  
  // Default to Toronto if not found
  return CITY_COORDINATES["toronto"];
}

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

    const { doctorId } = await req.json();
    
    if (!doctorId) {
      throw new Error("Missing doctorId");
    }

    // Get doctor details
    const { data: doctor, error: doctorError } = await supabaseClient
      .from("doctors")
      .select("*")
      .eq("id", doctorId)
      .single();

    if (doctorError || !doctor) {
      throw new Error(`Doctor not found: ${doctorError?.message}`);
    }

    logStep("Doctor found", { 
      name: doctor.full_name, 
      status: doctor.accepting_status,
      city: doctor.city 
    });

    // Only send alerts if doctor is accepting
    if (doctor.accepting_status !== "accepting") {
      logStep("Doctor not accepting, skipping alerts");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Doctor not accepting, no alerts sent",
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
        const alertCoords = getCityCoordinates(alert.city_postal);
        if (!alertCoords) continue;

        const distance = calculateDistance(
          alertCoords.lat,
          alertCoords.lng,
          Number(doctor.latitude),
          Number(doctor.longitude)
        );

        const radiusKm = alert.radius_km || 25;

        if (distance <= radiusKm) {
          logStep("Match found", { 
            subscriberEmail: subscriber.email, 
            alertCity: alert.city_postal,
            distance: Math.round(distance),
            radius: radiusKm
          });

          // Send alert email
          try {
            await resend.emails.send({
              from: "FindYourDoctor <alerts@findyourdoctor.ca>",
              to: [subscriber.email],
              subject: `🎉 Doctor Alert: ${doctor.full_name} is now accepting patients in ${doctor.city}!`,
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #00857C 0%, #00A6A6 100%); padding: 30px; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Great News!</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                      A doctor near ${alert.city_postal} is now accepting patients
                    </p>
                  </div>
                  
                  <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; border-top: none;">
                    <div style="background: white; padding: 24px; border-radius: 8px; border-left: 4px solid #22c55e;">
                      <h2 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 20px;">${doctor.full_name}</h2>
                      <p style="margin: 0 0 16px 0; color: #666; font-size: 16px;">${doctor.clinic_name}</p>
                      
                      <div style="margin-bottom: 16px;">
                        <p style="margin: 0; font-size: 14px; color: #666;">📍 ${doctor.address}, ${doctor.city}, ${doctor.province} ${doctor.postal_code}</p>
                        <p style="margin: 4px 0 0 0; font-size: 14px; color: #666;">📏 ~${Math.round(distance)} km from ${alert.city_postal}</p>
                      </div>
                      
                      <a href="tel:${doctor.phone.replace(/[^0-9]/g, "")}" style="display: inline-block; background: #00857C; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        📞 Call Now: ${doctor.phone}
                      </a>
                    </div>
                    
                    <p style="margin: 24px 0 0 0; font-size: 14px; color: #666;">
                      <strong>⚡ Act fast!</strong> Doctors fill up quickly. We recommend calling immediately.
                    </p>
                    
                    <a href="${siteUrl}/doctors/${doctor.id}" style="display: inline-block; margin-top: 16px; color: #00857C; font-size: 14px;">
                      View Full Details →
                    </a>
                  </div>
                  
                  <div style="padding: 20px; text-align: center; font-size: 12px; color: #999;">
                    <p>You're receiving this because you have alerts set for ${alert.city_postal}.</p>
                    <p>
                      <a href="${siteUrl}/dashboard" style="color: #00857C;">Manage your alerts</a> | 
                      <a href="${siteUrl}" style="color: #00857C;">FindYourDoctor.ca</a>
                    </p>
                  </div>
                </body>
                </html>
              `,
            });
            
            alertsSent++;
            logStep("Alert email sent", { to: subscriber.email });
          } catch (emailError: any) {
            logStep("Error sending email", { 
              to: subscriber.email, 
              error: emailError.message 
            });
          }

          // Only send one alert per subscriber per doctor
          break;
        }
      }
    }

    logStep("Alert engine completed", { alertsSent });

    return new Response(JSON.stringify({ 
      success: true, 
      alertsSent,
      doctorId,
      doctorName: doctor.full_name
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

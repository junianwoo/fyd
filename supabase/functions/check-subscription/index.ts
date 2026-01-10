import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

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
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // First, check if user has Assisted Access
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("status, assisted_expires_at")
      .eq("user_id", user.id)
      .single();

    if (profile?.status === "assisted_access") {
      logStep("User has Assisted Access, checking expiry");
      
      if (profile.assisted_expires_at) {
        const expiryDate = new Date(profile.assisted_expires_at);
        const now = new Date();
        
        if (expiryDate > now) {
          logStep("Assisted Access is still valid", { expiresAt: profile.assisted_expires_at });
          return new Response(JSON.stringify({ 
            subscribed: true,
            status: "assisted_access",
            expires_at: profile.assisted_expires_at
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else {
          logStep("Assisted Access has expired, downgrading to free");
          // Expired, downgrade to free
          await supabaseClient
            .from("profiles")
            .update({ status: "free" })
            .eq("user_id", user.id);
          
          return new Response(JSON.stringify({ 
            subscribed: false,
            status: "free",
            message: "Assisted Access has expired"
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
    }

    // Check Stripe subscription
    const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, returning unsubscribed state");
      
      // Only update to free if they're not already assisted_access
      if (profile?.status !== "assisted_access") {
        await supabaseClient
          .from("profiles")
          .update({ status: "free", subscription_status: null })
          .eq("user_id", user.id);
      }
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        status: profile?.status === "assisted_access" ? "assisted_access" : "free"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionEnd = null;
    let subscriptionId = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      subscriptionId = subscription.id;
      logStep("Active subscription found", { subscriptionId, endDate: subscriptionEnd });
      
      // Update profile to alert_service status
      await supabaseClient
        .from("profiles")
        .update({ 
          status: "alert_service",
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: "active"
        })
        .eq("user_id", user.id);
    } else {
      logStep("No active subscription found");
      
      // Update profile to free status
      await supabaseClient
        .from("profiles")
        .update({ 
          status: "free",
          stripe_customer_id: customerId,
          subscription_status: null
        })
        .eq("user_id", user.id);
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      status: hasActiveSub ? "alert_service" : "free",
      subscription_end: subscriptionEnd,
      subscription_id: subscriptionId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

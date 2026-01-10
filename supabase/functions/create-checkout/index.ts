import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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

    // Get email from request body or from authenticated user
    const body = await req.json();
    let email = body.email;
    let userId = null;

    // Check if user is authenticated (optional)
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      if (data.user) {
        userId = data.user.id;
        email = email || data.user.email;
        logStep("Authenticated user", { userId, email });
      }
    }

    // Validate email
    if (!email) throw new Error("Email is required");
    logStep("Email provided", { email, authenticated: !!userId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
      
      // Check for existing active subscriptions to prevent duplicates
      const existingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });

      if (existingSubscriptions.data.length > 0) {
        logStep("Customer already has active subscription", { 
          customerId, 
          subscriptionId: existingSubscriptions.data[0].id 
        });
        
        const origin = req.headers.get("origin") || "https://findyourdoctor.ca";
        return new Response(JSON.stringify({ 
          error: "You already have an active subscription. Please manage your existing subscription from your dashboard.",
          redirectUrl: `${origin}/dashboard`
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    } else {
      logStep("No existing customer, will create new");
    }

    const origin = req.headers.get("origin") || "https://findyourdoctor.ca";
    
    // Alert Service price ID - get from environment or use default
    const priceId = Deno.env.get("STRIPE_PRICE_ID") || "price_1SmQomEfiuQ9vCM5ZTvlL7V3";
    logStep("Using price ID", { priceId });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/check-email?email=${encodeURIComponent(email)}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        user_id: userId || "",
        email: email,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
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

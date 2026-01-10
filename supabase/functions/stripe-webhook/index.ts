import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-11-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    logStep("ERROR: No signature provided");
    return new Response(JSON.stringify({ error: "No signature" }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await req.text();
    logStep("Received webhook request", { signaturePresent: !!signature });

    // Verify the webhook signature (use async version)
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    logStep("Webhook signature verified", { eventType: event.type, eventId: event.id });

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        let userId = session.metadata?.user_id;
        const email = session.metadata?.email || session.customer_details?.email;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        logStep("Checkout session completed", { 
          userId, 
          email,
          customerId, 
          subscriptionId,
          mode: session.mode 
        });

        if (!email) {
          logStep("ERROR: No email found in session");
          break;
        }

        if (session.mode === "subscription") {
          // Check if user already exists
          if (!userId) {
            // Check if user exists by email
            const { data: existingProfile } = await supabase
              .from("profiles")
              .select("user_id")
              .eq("email", email)
              .maybeSingle();

            if (existingProfile) {
              userId = existingProfile.user_id;
              logStep("Found existing user by email", { userId, email });
            } else {
              // Create new user account
              try {
                // Generate a random password (user will need to reset it)
                const randomPassword = crypto.randomUUID();
                
                const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                  email: email,
                  password: randomPassword,
                  email_confirm: true,
                  user_metadata: {
                    created_via: "stripe_payment",
                  },
                });

                if (authError) {
                  logStep("ERROR creating user account", { error: authError, email });
                  // If user already exists in auth, try to find their profile
                  const { data: { user: existingUser }, error: getUserError } = await supabase.auth.admin.getUserByEmail(email);
                  if (existingUser) {
                    userId = existingUser.id;
                    logStep("Found existing auth user", { userId, email });
                  } else {
                    throw authError;
                  }
                } else {
                  userId = authData.user.id;
                  logStep("User account created", { userId, email });

                  // Create profile (if not exists)
                  const { error: profileError } = await supabase
                    .from("profiles")
                    .insert({
                      user_id: userId,
                      email: email,
                      stripe_customer_id: customerId,
                      stripe_subscription_id: subscriptionId,
                      status: "alert_service",
                    });

                  if (profileError && !profileError.message.includes("duplicate")) {
                    logStep("ERROR creating profile", { error: profileError, userId });
                  } else {
                    logStep("Profile created successfully", { userId });
                  }

                  // Generate password reset link for new user
                  const siteUrl = Deno.env.get("SITE_URL") || "https://findyourdoctor.ca";
                  logStep("Generating password reset link", { email, siteUrl });
                  
                  let passwordResetUrl = `${siteUrl}/reset-password`;
                  try {
                    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
                      type: 'recovery',
                      email: email,
                      options: {
                        redirectTo: `${siteUrl}/reset-password`
                      }
                    });
                    
                    if (!resetError && resetData) {
                      passwordResetUrl = resetData.properties?.action_link || passwordResetUrl;
                      logStep("Password reset link generated", { email });
                    }
                  } catch (linkError) {
                    logStep("ERROR generating password reset link", { error: linkError });
                  }
                  
                  // Send branded welcome email with password setup link
                  logStep("Sending paid welcome email", { email, siteUrl });
                  
                  try {
                    // Get subscription amount from Stripe
                    let amount = "$7.99";
                    if (subscriptionId) {
                      try {
                        const sub = await stripe.subscriptions.retrieve(subscriptionId);
                        const priceAmount = sub.items.data[0]?.price.unit_amount || 799;
                        amount = `$${(priceAmount / 100).toFixed(2)}`;
                      } catch (subError) {
                        logStep("Could not retrieve subscription details", { error: subError });
                      }
                    }
                    
                    await supabase.functions.invoke("send-paid-welcome", {
                      body: {
                        email,
                        subscriptionId,
                        amount,
                        passwordResetUrl,
                      },
                    });
                    logStep("Paid welcome email sent with password setup link", { email });
                  } catch (welcomeError) {
                    logStep("ERROR sending paid welcome email", { error: welcomeError });
                  }
                }
              } catch (error) {
                logStep("ERROR in user creation flow", { error, email });
              }
            }
          }

          // Update profile with subscription details
          if (userId) {
            const { error } = await supabase
              .from("profiles")
              .update({
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                status: "alert_service",
              })
              .eq("user_id", userId);

            if (error) {
              logStep("ERROR updating profile", { error, userId });
            } else {
              logStep("Profile updated successfully", { userId, status: "alert_service" });
            }
          }
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        logStep("Subscription created", { 
          subscriptionId: subscription.id,
          customerId,
          status: subscription.status 
        });

        const { error } = await supabase
          .from("profiles")
          .update({
            stripe_subscription_id: subscription.id,
            status: subscription.status === "active" ? "alert_service" : "free",
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          logStep("ERROR updating profile on subscription create", { error, customerId });
        } else {
          logStep("Profile updated on subscription create", { customerId });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status === "active" ? "alert_service" : "free";

        logStep("Subscription updated", { 
          subscriptionId: subscription.id,
          stripeStatus: subscription.status,
          newStatus: status 
        });

        const { error } = await supabase
          .from("profiles")
          .update({ status })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          logStep("ERROR updating profile on subscription update", { error, subscriptionId: subscription.id });
        } else {
          logStep("Profile updated on subscription update", { subscriptionId: subscription.id, status });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        logStep("Subscription deleted", { subscriptionId: subscription.id });

        const { error } = await supabase
          .from("profiles")
          .update({ 
            status: "free",
            stripe_subscription_id: null,
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          logStep("ERROR updating profile on subscription delete", { error, subscriptionId: subscription.id });
        } else {
          logStep("Profile updated on subscription delete", { subscriptionId: subscription.id });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        logStep("Invoice payment succeeded", { 
          invoiceId: invoice.id,
          subscriptionId,
          amount: invoice.amount_paid 
        });

        // Ensure the user has active status
        if (subscriptionId) {
          const { error } = await supabase
            .from("profiles")
            .update({ status: "alert_service" })
            .eq("stripe_subscription_id", subscriptionId);

          if (error) {
            logStep("ERROR updating profile on payment success", { error, subscriptionId });
          } else {
            logStep("Profile updated on payment success", { subscriptionId });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        logStep("Invoice payment failed", { 
          invoiceId: invoice.id,
          subscriptionId,
          attemptCount: invoice.attempt_count 
        });

        if (subscriptionId) {
          const { error } = await supabase
            .from("profiles")
            .update({ status: "free" })
            .eq("stripe_subscription_id", subscriptionId);

          if (error) {
            logStep("ERROR updating profile on payment failure", { error, subscriptionId });
          } else {
            logStep("Profile updated on payment failure", { subscriptionId });
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { eventType: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logStep("ERROR processing webhook", { error: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});

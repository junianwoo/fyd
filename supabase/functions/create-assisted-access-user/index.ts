import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "../_shared/cors.ts";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-ASSISTED-ACCESS-USER] ${step}${detailsStr}`);
};

interface CreateUserRequest {
  email: string;
  city: string;
  reason: string;
  recaptchaToken: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { email, city, reason, recaptchaToken }: CreateUserRequest = await req.json();
    
    if (!email || !city || !reason || !recaptchaToken) {
      throw new Error("Missing required fields");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    logStep("Checking for existing user", { email });

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("user_id, email, status")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      logStep("User already exists", { email, status: existingProfile.status });
      throw new Error("This email is already registered. Please log in to your account.");
    }

    logStep("Creating user with admin.createUser", { email });

    // Generate a secure temporary password
    const temporaryPassword = crypto.randomUUID() + 'Aa1!_';
    
    // Create user with email already confirmed
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true, // This prevents the default confirmation email
      user_metadata: {
        applying_for_assisted_access: true,
        assisted_reason: reason,
        city: city,
      },
    });

    if (authError) {
      logStep("ERROR creating user", { error: authError.message });
      throw authError;
    }

    if (!authData.user) {
      throw new Error("Failed to create user account");
    }

    const userId = authData.user.id;
    logStep("User created successfully", { userId, email });

    // Calculate expiry date (6 months from now)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 6);

    // Wait a moment for the trigger to create the basic profile
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update the profile with assisted_access details
    // Note: The profile is created automatically by the on_auth_user_created trigger
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        status: "assisted_access",
        assisted_expires_at: expiryDate.toISOString(),
        assisted_reason: reason,
        assisted_renewed_count: 0,
      })
      .eq("user_id", userId);

    if (profileError) {
      logStep("ERROR updating profile", { error: profileError, userId });
      // Try to clean up the auth user if profile update failed
      await supabase.auth.admin.deleteUser(userId);
      throw new Error("Failed to update user profile");
    }

    logStep("Profile updated successfully", { userId, status: "assisted_access", expiresAt: expiryDate });

    // Send branded welcome email with password setup link
    try {
      logStep("Sending welcome email", { email, userId });
      
      await supabase.functions.invoke("send-assisted-access-welcome", {
        body: {
          email,
          userId,
        },
      });
      
      logStep("Welcome email sent successfully");
    } catch (emailError: any) {
      logStep("ERROR sending welcome email", { error: emailError.message });
      // Don't fail the entire flow if email fails
      // User account is still created and they can request a password reset
    }

    return new Response(JSON.stringify({ 
      success: true,
      userId,
      message: "Assisted access account created successfully",
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to create assisted access account"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

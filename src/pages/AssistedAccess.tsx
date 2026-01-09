import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// reCAPTCHA site key (v2 checkbox)
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

export default function AssistedAccess() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  // Load reCAPTCHA script
  useEffect(() => {
    if (window.grecaptcha) {
      setRecaptchaLoaded(true);
      return;
    }

    window.onRecaptchaLoad = () => {
      setRecaptchaLoaded(true);
    };

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      window.onRecaptchaLoad = () => {};
    };
  }, []);

  // Render reCAPTCHA widget
  useEffect(() => {
    if (recaptchaLoaded && window.grecaptcha?.render) {
      try {
        const container = document.getElementById("recaptcha-container");
        if (container && !container.hasChildNodes()) {
          window.grecaptcha.render("recaptcha-container", {
            sitekey: RECAPTCHA_SITE_KEY,
            callback: (token: string) => setRecaptchaToken(token),
            "expired-callback": () => setRecaptchaToken(null),
          });
        }
      } catch (e) {
        console.log("reCAPTCHA already rendered");
      }
    }
  }, [recaptchaLoaded]);

  // Check if email exists when user types
  const checkEmailExists = useCallback(async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes('@')) {
      setEmailExists(false);
      return;
    }

    setCheckingEmail(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("status")
        .eq("email", emailToCheck)
        .maybeSingle();

      setEmailExists(!!data);
    } catch (error) {
      console.error("Error checking email:", error);
    } finally {
      setCheckingEmail(false);
    }
  }, []);

  // Debounce email check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (email) {
        checkEmailExists(email);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email, checkEmailExists]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !city || reason.length < 20 || !confirmed) {
      toast({
        title: "Please complete all fields",
        description: "All fields are required. Reason must be at least 20 characters.",
        variant: "destructive",
      });
      return;
    }

    if (!recaptchaToken) {
      toast({
        title: "Please complete the reCAPTCHA",
        description: "This helps us prevent spam submissions.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if email already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("status, email")
        .eq("email", email)
        .maybeSingle();

      if (existingProfile) {
        setLoading(false);
        
        if (existingProfile.status === "alert_service") {
          toast({
            title: "You already have Alert Service",
            description: "You're currently subscribed to Alert Service. You can manage your subscription in your dashboard.",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        } else if (existingProfile.status === "assisted_access") {
          toast({
            title: "You already have Assisted Access",
            description: "Your Assisted Access is already active. Check your email or sign in to access your dashboard.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        } else {
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }
      }

      // Verify reCAPTCHA
      const { data: recaptchaResult, error: recaptchaError } = await supabase.functions.invoke("verify-recaptcha", {
        body: { token: recaptchaToken },
      });

      if (recaptchaError || !recaptchaResult?.success) {
        toast({
          title: "reCAPTCHA verification failed",
          description: "Please try again.",
          variant: "destructive",
        });
        setLoading(false);
        window.grecaptcha?.reset();
        setRecaptchaToken(null);
        return;
      }

      // Create account with a temporary password
      // User will receive confirmation email with link to set their password
      const temporaryPassword = crypto.randomUUID() + 'Aa1!_';
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: temporaryPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/reset-password`,
          data: {
            applying_for_assisted_access: true,
            assisted_reason: reason,
            city: city,
          }
        },
      });

      if (signUpError) throw signUpError;

      if (!signUpData.user) {
        throw new Error("Failed to create account");
      }

      console.log("Account created:", signUpData.user.id);

      // Success! Redirect to confirmation page
      toast({
        title: "Application Submitted!",
        description: "Check your email to set your password and activate your account.",
      });
      
      // Navigate to confirmation/waiting page
      navigate("/assisted-access/confirmation", { 
        state: { email, newUser: true }
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-background py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-6">
            <Heart className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl text-foreground mb-4">
            Can't Afford Alert Service?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We believe everyone deserves access to healthcare. If you genuinely cannot 
            afford $7.99/month, we'll give you full access for 6 months.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Apply for Assisted Access</CardTitle>
              <CardDescription>
                Fill out the form below. Approval is instant.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={emailExists ? "border-destructive" : ""}
                    required
                  />
                  {checkingEmail && (
                    <p className="text-xs text-muted-foreground">Checking email...</p>
                  )}
                  {emailExists && !checkingEmail && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-2">
                      <p className="text-sm text-destructive font-semibold">
                        This email already has an account
                      </p>
                      <p className="text-xs text-destructive/80 mt-1">
                        If you already have Alert Service or Assisted Access, please <a href="/auth" className="underline font-semibold">sign in</a> instead.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="e.g., Toronto"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Why do you need assistance? *</Label>
                  <Textarea
                    id="reason"
                    placeholder="e.g., Currently unemployed, On disability, Fixed pension..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 20 characters ({reason.length}/20)
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="confirm"
                    checked={confirmed}
                    onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                  />
                  <Label htmlFor="confirm" className="text-sm leading-tight cursor-pointer">
                    I confirm I genuinely cannot afford $7.99/month and understand this 
                    program is for those in financial need.
                  </Label>
                </div>

                {/* reCAPTCHA */}
                <div className="space-y-2">
                  <div id="recaptcha-container" className="flex justify-center"></div>
                  <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                    <Shield className="h-3 w-3" />
                    Protected by reCAPTCHA
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading || !confirmed || !recaptchaToken}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Get Assisted Access"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/auth" className="text-secondary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

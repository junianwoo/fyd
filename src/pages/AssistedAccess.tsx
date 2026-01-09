import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Loader2, Shield, CheckCircle, Bell, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import communityImage from "@/assets/Gemini_Generated_Image_r0ajmr0ajmr0ajmr (1).png";

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
        description: "All fields are required. Brief note must be at least 20 characters.",
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
      {/* Hero Section with Image */}
      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 max-w-6xl mx-auto">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl text-primary mb-6">
                We've Got You Covered
              </h1>
              <p className="text-xl text-muted-foreground">
                If $7.99/month is a barrier for you right now, we'll provide Alert Service at no cost. Everyone deserves access to tools that help them find healthcare.
              </p>
            </div>
            <div className="flex-shrink-0 w-full md:w-1/2 max-w-md">
              <img 
                src={communityImage} 
                alt="Community support" 
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What Is Assisted Access */}
      <section className="bg-background py-20 md:py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl text-primary mb-6">
              What Is Assisted Access?
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Assisted Access provides free Alert Service for 6 months to those facing financial barriers. We believe cost shouldn't prevent anyone from getting the support they need to find a family doctor.
            </p>
            <p className="text-lg text-muted-foreground">
              This program is funded by our paid Alert Service subscribers, who make it possible for us to help those in need.
            </p>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="bg-background-alt py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl text-primary mb-8 text-center">
              What's Included
            </h2>
            
            <div className="bg-card p-8 rounded-xl border border-border mb-8">
              <h3 className="text-xl text-foreground mb-4 font-semibold">Full Access to Alert Service:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-status-accepting flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Monitor up to 3 cities</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-status-accepting flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Instant email alerts when doctors start accepting patients</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-status-accepting flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">All the same features as paid Alert Service</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-status-accepting flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">6 months of access</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-lg text-foreground mb-2 font-semibold">After 6 Months:</h3>
              <p className="text-muted-foreground">
                At the end of your term, you can renew with a single click if you still need support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Apply */}
      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl text-primary mb-6">
              Apply for Assisted Access
            </h2>
            <p className="text-lg text-muted-foreground">
              We don't require proof of income or documentation. We trust you to assess your own situation. Applications are approved instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="bg-background-alt py-16 md:py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Application Form</CardTitle>
              <CardDescription>
                Complete the form below to apply for Assisted Access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={emailExists ? "border-destructive" : ""}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    We'll send your Alert Service access to this email.
                  </p>
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
                  <Label htmlFor="city">City You're Monitoring *</Label>
                  <Input
                    id="city"
                    placeholder="e.g., Toronto"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Which city do you need alerts for? (You can add 2 more cities after approval)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Brief Note *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Help us understand your situation in a few words..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Help us understand your situation in a few words. This helps us improve the program.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Character count: ({reason.length}/20 minimum)
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="confirm"
                    checked={confirmed}
                    onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                  />
                  <Label htmlFor="confirm" className="text-sm leading-tight cursor-pointer">
                    I confirm that $7.99/month is a financial barrier for me right now.
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

                <Button type="submit" className="w-full" size="lg" disabled={loading || !confirmed || !recaptchaToken}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Submit Application"
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

      {/* Reassurance Section */}
      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-lg text-foreground mb-2 font-semibold">Your Privacy</h3>
                <p className="text-muted-foreground">
                  Your application is confidential. We don't share this information with anyone.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg text-foreground mb-2 font-semibold">What Happens Next</h3>
                <p className="text-muted-foreground">
                  Your application is approved instantly. You'll receive an email with instructions to set up your Alert Service access within minutes.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg text-foreground mb-2 font-semibold">If Your Situation Improves</h3>
                <p className="text-muted-foreground">
                  If your financial situation improves during the 6 months, we kindly ask that you consider upgrading to the paid Alert Service. Paid subscribers make it possible for us to continue offering Assisted Access to others who need it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-background-alt py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl text-primary text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem 
                value="item-0"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Will anyone know I'm using Assisted Access?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Your Assisted Access status is shown in your private account dashboard, but it's only visible to you. No one else can see it unless you choose to share that information. You receive the same Alert Service as paid subscribers.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-1"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Do I need to reapply after 6 months?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. At the end of 6 months, you'll receive an email with a link to renew. One click and you're set for another 6 months if you still need support.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-2"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  What if I can only afford some months but not others?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  If your situation changes during the 6 months, you can upgrade to paid Alert Service anytime, or you can continue with Assisted Access. We trust you to make the right choice for your situation.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-3"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Is there a limit to how many times I can use Assisted Access?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. You can renew every 6 months as long as you need support. We're here to help, not to judge.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-4"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  What information do you collect?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We only collect what's necessary: your email address, the city you're monitoring, and a brief note about your situation. This helps us understand how to improve the program.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-5"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Can I add more cities after I'm approved?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. Once approved, you can monitor up to 3 Ontario cities total—just like paid Alert Service.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Alternative Options */}
      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl text-primary mb-6">
              Other Ways We Can Help
            </h2>
            <div className="bg-card p-8 rounded-xl border border-border">
              <h3 className="text-xl text-foreground mb-3">Free Search Always Available</h3>
              <p className="text-muted-foreground mb-6">
                Remember, searching our doctor directory is completely free and requires no signup. You can check anytime for accepting doctors without any barriers.
              </p>
              <Button variant="outline" size="lg" asChild>
                <Link to="/doctors">Browse Doctors for Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

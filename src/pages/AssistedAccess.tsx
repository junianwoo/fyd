import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function AssistedAccess() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

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

    setLoading(true);

    try {
      // Check if user exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("user_id, status")
        .eq("email", email)
        .maybeSingle();

      if (existingProfile) {
        if (existingProfile.status === "alert_service") {
          toast({
            title: "Active subscription detected",
            description: "Please cancel your subscription first before applying for Assisted Access.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        if (existingProfile.status === "assisted_access") {
          toast({
            title: "You already have Assisted Access",
            description: "Sign in to access your dashboard.",
          });
          navigate("/auth");
          return;
        }

        // Calculate expiry date (6 months from now)
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 6);

        // Update existing user to assisted_access
        await supabase
          .from("profiles")
          .update({ 
            status: "assisted_access",
            assisted_reason: reason,
            assisted_expires_at: expiresAt.toISOString(),
            assisted_renewed_count: 0,
          })
          .eq("user_id", existingProfile.user_id);
          
        toast({
          title: "Assisted Access Granted!",
          description: "Your account has been upgraded. Sign in to start using alerts.",
        });
        navigate("/auth");
      } else {
        // Create new account with assisted access
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: Math.random().toString(36).slice(-12) + "Aa1!", // Temporary password
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (signUpError) throw signUpError;

        // Wait a moment for the trigger to create the profile, then update it
        if (signUpData.user) {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 6);

          // Wait for profile to be created by trigger
          await new Promise(resolve => setTimeout(resolve, 1000));

          await supabase
            .from("profiles")
            .update({ 
              status: "assisted_access",
              assisted_reason: reason,
              assisted_expires_at: expiresAt.toISOString(),
              assisted_renewed_count: 0,
            })
            .eq("user_id", signUpData.user.id);
        }
        
        toast({
          title: "Assisted Access Granted!",
          description: "Check your email to set your password and activate your account.",
        });
        navigate("/auth");
      }
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
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
                    required
                  />
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

                <Button type="submit" className="w-full" disabled={loading || !confirmed}>
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

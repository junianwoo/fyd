import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle, Mail, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function AssistedAccessConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checking, setChecking] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const stateEmail = location.state?.email;
    if (stateEmail) {
      setUserEmail(stateEmail);
    } else if (!user) {
      // No state and no user, redirect back
      navigate("/assisted-access");
    }
  }, [location.state, user, navigate]);

  // If user logs in, check their status and redirect
  useEffect(() => {
    const checkStatusAndRedirect = async () => {
      if (user) {
        setChecking(true);
        
        // Check user's profile status
        const { data: profile } = await supabase
          .from("profiles")
          .select("status")
          .eq("user_id", user.id)
          .single();
        
        if (profile?.status === "assisted_access") {
          // Success! Redirect to dashboard
          navigate("/dashboard");
        } else {
          // Still processing or error
          setChecking(false);
        }
      }
    };

    checkStatusAndRedirect();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
            {checking ? (
              <Loader2 className="h-8 w-8 text-accent animate-spin" />
            ) : (
              <Mail className="h-8 w-8 text-accent" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {checking ? "Setting Up Your Account..." : "Check Your Email"}
          </CardTitle>
          <CardDescription>
            {checking 
              ? "Please wait while we finalize your Assisted Access."
              : "We've sent you an email to complete your setup"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!checking && (
            <>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <CheckCircle className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Application Approved</p>
                    <p className="text-sm text-muted-foreground">
                      Your Assisted Access application has been approved and processed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Mail className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Email Sent</p>
                    <p className="text-sm text-muted-foreground">
                      We've sent a password setup link to <strong>{userEmail}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Next Steps:</h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-foreground">1.</span>
                    <span>Check your email inbox (and spam folder)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-foreground">2.</span>
                    <span>Click the "Confirm your email" link</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-foreground">3.</span>
                    <span>Set your password</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-foreground">4.</span>
                    <span>Access your dashboard with Assisted Access!</span>
                  </li>
                </ol>
              </div>

              <div className="pt-4">
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-foreground mb-1">
                    ⏳ Waiting for you to set your password
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This page will automatically redirect once you complete the setup
                  </p>
                </div>
                
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Didn't receive an email?{" "}
                  <Link to="/contact" className="text-accent hover:underline">
                    Contact support
                  </Link>
                </p>
              </div>
            </>
          )}

          {checking && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                We're upgrading your account to Assisted Access...
              </p>
              <div className="flex justify-center gap-1">
                <div className="h-2 w-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

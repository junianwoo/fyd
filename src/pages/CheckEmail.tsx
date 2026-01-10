import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import logoColour from "@/assets/logo-colour.png";

export default function CheckEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Simple check: if user already has active session, go to dashboard
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // User is already authenticated - go to dashboard
        navigate("/dashboard");
        return;
      }
      
      setChecking(false);
    };

    checkSession();
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logoColour} alt="Find Your Doctor" className="h-12" />
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-accent" />
            </div>
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription className="text-base">
            Your payment was successful! 🎉
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground mb-1">
                  Step 1: Check Your Inbox
                </p>
                <p className="text-sm text-muted-foreground">
                  We sent an email to <strong className="text-foreground">{email || "your email"}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground mb-1">
                  Step 2: Set Your Password
                </p>
                <p className="text-sm text-muted-foreground">
                  Click the link in the email to set your password
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground mb-1">
                  Step 3: Access Your Dashboard
                </p>
                <p className="text-sm text-muted-foreground">
                  After setting your password, you'll be redirected to your dashboard
                </p>
              </div>
            </div>
          </div>

          <div className="bg-background-alt p-4 rounded-lg space-y-2">
            <p className="text-sm font-semibold text-foreground">
              📧 Didn't receive the email?
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Check your spam/junk folder</li>
              <li>• Look for email from: <code className="text-xs bg-background px-1 py-0.5 rounded">no-reply@findyourdoctor.ca</code></li>
              <li>• Email may take a few minutes to arrive</li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Your Alert Service subscription is active and ready to use once you complete setup.
            </p>
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate("/")}
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

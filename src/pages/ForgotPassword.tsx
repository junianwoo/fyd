import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logoColour from "@/assets/logo-colour.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.functions.invoke("send-password-reset", {
      body: { email },
    });

    if (error || !data?.success) {
      toast({
        title: "Error sending reset email",
        description: error?.message || data?.error || "Failed to send reset email",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Success - show confirmation
    setEmailSent(true);
    setLoading(false);
  };

  if (emailSent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-background py-12 px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Link to="/" className="inline-block mx-auto mb-4">
              <img src={logoColour} alt="Find Your Doctor" className="h-12" />
            </Link>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We've sent you a password reset link
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                We sent a password reset link to:
              </p>
              <p className="font-semibold text-foreground">{email}</p>
              <p className="text-sm text-muted-foreground">
                Click the link in the email to reset your password.
              </p>
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

            <div className="flex flex-col gap-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setEmailSent(false)}
              >
                Try Different Email
              </Button>
              <Button 
                asChild
                variant="ghost"
                className="w-full"
              >
                <Link to="/auth">Back to Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img src={logoColour} alt="FindYourDoctor.ca" className="h-10" />
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-accent/10 p-3">
                <Mail className="h-8 w-8 text-accent" />
              </div>
            </div>
            <CardTitle className="text-2xl">Forgot Password?</CardTitle>
            <CardDescription>
              Enter your email and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reset Link
                  </>
                )}
              </Button>

              <div className="text-center pt-4">
                <Link 
                  to="/auth" 
                  className="text-sm text-secondary hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

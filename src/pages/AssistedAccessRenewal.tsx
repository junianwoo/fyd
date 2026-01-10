import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Loader2, AlertCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssistedAccessRenewal() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!userId) {
      setStatus("error");
      setErrorMessage("Invalid renewal link. Please check your email or contact support.");
      return;
    }

    // Process the renewal
    const processRenewal = async () => {
      try {
        const response = await fetch(`/api/renew-assisted-access?userId=${userId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          if (data.newExpiryDate) {
            const date = new Date(data.newExpiryDate);
            setExpiryDate(date.toLocaleDateString("en-CA", {
              year: "numeric",
              month: "long",
              day: "numeric"
            }));
          }
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Failed to renew your access. Please try again or contact support.");
        }
      } catch (error) {
        setStatus("error");
        setErrorMessage("An unexpected error occurred. Please contact support.");
      }
    };

    processRenewal();
  }, [userId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="h-16 w-16 text-secondary animate-spin" />
              </div>
              <CardTitle className="text-3xl">Processing Your Renewal...</CardTitle>
              <CardDescription>Please wait while we extend your access.</CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-4">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-3xl text-green-600">Access Renewed!</CardTitle>
              <CardDescription>Your Assisted Access has been successfully extended.</CardDescription>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100 p-4">
                  <AlertCircle className="h-16 w-16 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-3xl text-red-600">Renewal Failed</CardTitle>
              <CardDescription>We couldn't complete your renewal.</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {status === "success" && (
            <>
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <div className="flex items-start">
                  <Heart className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">
                      Welcome Back for Another 6 Months
                    </h3>
                    <p className="text-sm text-green-800">
                      You can continue receiving instant email alerts when doctors near you start accepting new patients.
                    </p>
                  </div>
                </div>
              </div>

              {expiryDate && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-2">Your new expiry date:</p>
                  <p className="text-2xl font-bold text-primary">{expiryDate}</p>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="font-semibold text-foreground mb-3">What's Next?</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-secondary mr-2">✓</span>
                    <span>Your alert settings remain active and unchanged</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-2">✓</span>
                    <span>You'll receive an email reminder 30 days before your next expiry</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-2">✓</span>
                    <span>You can upgrade to paid Alert Service anytime</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button asChild className="flex-1">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/doctors">Search Doctors</Link>
                </Button>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  💛 If your financial situation improves, please consider upgrading to the{" "}
                  <Link to="/pricing" className="text-secondary hover:underline">
                    paid Alert Service
                  </Link>
                  . Your subscription helps us continue offering Assisted Access to others.
                </p>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">What you can do:</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Try clicking the renewal link in your email again</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Contact us at support@findyourdoctor.ca for help</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Reapply for Assisted Access if your previous access has expired</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link to="/contact">Contact Support</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

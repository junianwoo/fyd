import { useState, useEffect } from "react";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LocationPromptProps {
  onLocationGranted: (coords: { lat: number; lng: number }) => void;
}

export function LocationPrompt({ onLocationGranted }: LocationPromptProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoading(false);
        onLocationGranted({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Location access was denied. Please enable location in your browser settings to see doctors near you.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.");
            break;
          case err.TIMEOUT:
            setError("Location request timed out. Please try again.");
            break;
          default:
            setError("An error occurred while getting your location.");
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  };

  // Auto-request location on mount (triggers browser's native popup)
  useEffect(() => {
    requestLocation();
  }, []);

  // Show simple loading state while browser popup is active
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-secondary mx-auto mb-4" />
          <p className="text-muted-foreground">Waiting for location permission...</p>
        </div>
      </div>
    );
  }

  // Show error state with retry button only if there was an error
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Location Required
            </h2>
            
            <p className="text-muted-foreground mb-6">
              {error}
            </p>

            <Button onClick={requestLocation} size="lg" className="w-full">
              <MapPin className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              Your location is only used to sort doctors by distance and is never stored.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

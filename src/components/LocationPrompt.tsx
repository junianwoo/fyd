import { useState } from "react";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LocationPromptProps {
  onLocationGranted: (coords: { lat: number; lng: number }) => void;
}

export function LocationPrompt({ onLocationGranted }: LocationPromptProps) {
  const [loading, setLoading] = useState(false);
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
            setError("Location access was denied. Please enable location in your browser settings.");
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

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="h-8 w-8 text-secondary" />
          </div>
          
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Find Doctors Near You
          </h2>
          
          <p className="text-muted-foreground mb-6">
            To show you the closest family doctors accepting new patients, 
            we need to know your location.
          </p>

          {error && (
            <div className="flex items-start gap-2 text-destructive text-sm mb-6 text-left bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={requestLocation}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Getting Location...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Share My Location
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            Your location is only used to sort doctors by distance and is never stored.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

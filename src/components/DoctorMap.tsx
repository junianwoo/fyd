import { useEffect, useRef, useState } from "react";
import { Doctor } from "@/lib/doctors";
import { Loader2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DoctorMapProps {
  doctors: Doctor[];
  selectedDoctorId?: string;
  onDoctorSelect?: (doctorId: string) => void;
  className?: string;
}

declare global {
  interface Window {
    initGoogleMaps?: () => void;
  }
}

const statusColors: Record<string, string> = {
  accepting: "#22c55e",
  not_accepting: "#ef4444", 
  waitlist: "#f59e0b",
  unknown: "#6b7280",
};

export function DoctorMap({ doctors, selectedDoctorId, onDoctorSelect, className = "" }: DoctorMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Fetch API key from edge function
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-maps-key");
        if (error) throw error;
        setApiKey(data.apiKey);
      } catch (err) {
        console.error("Failed to fetch maps API key:", err);
        setError("Failed to load map configuration");
        setLoading(false);
      }
    };
    fetchApiKey();
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey) return;

    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      if (window.google?.maps) {
        setLoading(false);
      }
      return;
    }

    window.initGoogleMaps = () => {
      setLoading(false);
    };

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps&libraries=marker`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setError("Failed to load Google Maps");
      setLoading(false);
    };
    document.head.appendChild(script);

    return () => {
      window.initGoogleMaps = undefined;
    };
  }, [apiKey]);

  // Initialize map
  useEffect(() => {
    if (loading || error || !mapRef.current || !window.google?.maps) return;

    // Default center: Ontario, Canada
    const defaultCenter = { lat: 43.65107, lng: -79.347015 };
    
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 10,
      mapId: "doctor-finder-map",
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
  }, [loading, error]);

  // Update markers when doctors change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps?.marker) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.map = null);
    markersRef.current = [];

    if (doctors.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    doctors.forEach((doctor) => {
      const position = { lat: doctor.latitude, lng: doctor.longitude };
      bounds.extend(position);

      // Create custom marker element
      const markerElement = document.createElement("div");
      markerElement.className = "doctor-marker";
      markerElement.style.cssText = `
        width: 32px;
        height: 32px;
        background-color: ${statusColors[doctor.acceptingStatus] || statusColors.unknown};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transition: transform 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      if (selectedDoctorId === doctor.id) {
        markerElement.style.transform = "scale(1.3)";
        markerElement.style.zIndex = "100";
      }

      markerElement.addEventListener("mouseenter", () => {
        markerElement.style.transform = "scale(1.2)";
      });
      markerElement.addEventListener("mouseleave", () => {
        if (selectedDoctorId !== doctor.id) {
          markerElement.style.transform = "scale(1)";
        }
      });

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position,
        content: markerElement,
        title: doctor.fullName,
      });

      marker.addListener("click", () => {
        onDoctorSelect?.(doctor.id);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds with padding
    if (doctors.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      
      // Limit max zoom
      const listener = window.google.maps.event.addListener(mapInstanceRef.current, "idle", () => {
        const zoom = mapInstanceRef.current?.getZoom();
        if (zoom && zoom > 15) {
          mapInstanceRef.current?.setZoom(15);
        }
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [doctors, selectedDoctorId, onDoctorSelect]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-secondary/10 ${className}`}>
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-secondary/10 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-secondary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg text-xs">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors.accepting }} />
            <span>Accepting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors.waitlist }} />
            <span>Waitlist</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors.not_accepting }} />
            <span>Not Accepting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors.unknown }} />
            <span>Unknown</span>
          </div>
        </div>
      </div>
    </div>
  );
}

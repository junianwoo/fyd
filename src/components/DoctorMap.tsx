import { useEffect, useRef, useState } from "react";
import { Doctor } from "@/lib/doctors";
import { Loader2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DoctorMapProps {
  doctors: Doctor[];
  selectedDoctorId?: string;
  onDoctorSelect?: (doctorId: string) => void;
  userLocation?: { lat: number; lng: number } | null;
  className?: string;
}

declare global {
  interface Window {
    initGoogleMaps?: () => void;
  }
}

// Using standard intuitive colors for status markers
const statusColors: Record<string, string> = {
  accepting: "#22c55e",      // Green - universally understood as positive/go
  not_accepting: "#dc2626",  // Red - universally understood as stop/no
  waitlist: "#F4A261",       // Orange - caution/waiting
  unknown: "#6b7280",        // Gray - unknown/neutral
};

export function DoctorMap({ doctors, selectedDoctorId, onDoctorSelect, userLocation, className = "" }: DoctorMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Fetch API key - try env variable first, then edge function
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        // Check if API key is in environment variables first (recommended for simplicity)
        const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (envApiKey) {
          console.log("Using Google Maps API key from environment");
          setApiKey(envApiKey);
          return;
        }

        // Fallback to edge function if available (more secure for production)
        console.log("Attempting to fetch Google Maps API key from edge function...");
        const { data, error } = await supabase.functions.invoke("get-maps-key");
        if (error) throw error;
        setApiKey(data.apiKey);
        console.log("Google Maps API key fetched from edge function");
      } catch (err) {
        console.error("Failed to fetch maps API key:", err);
        setError("Failed to load map configuration. Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables or deploy the get-maps-key edge function.");
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps`;
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

  // Custom map styles based on FindYourDoctor brand colors
  const brandMapStyles: google.maps.MapTypeStyle[] = [
    // Water - Lighter Bright Teal
    { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#00A6A6" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#FFFFFF" }] },
    
    // Land/landscape - Deeper teal (primary)
    { featureType: "landscape", elementType: "geometry.fill", stylers: [{ color: "#0F4C5C" }] },
    { featureType: "landscape.natural", elementType: "geometry.fill", stylers: [{ color: "#0D4350" }] },
    
    // Parks - Slightly lighter teal variant
    { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#1A5F6F" }] },
    
    // Roads - Soft teal for minimal contrast
    { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#B8E0DD" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#00A6A6" }, { weight: 0.5 }] },
    { featureType: "road.arterial", elementType: "geometry.fill", stylers: [{ color: "#A8D8D5" }] },
    { featureType: "road.local", elementType: "geometry.fill", stylers: [{ color: "#98D0CC" }] },
    
    // Labels - Light text for dark background
    { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#F3FBFA" }] },
    { featureType: "all", elementType: "labels.text.stroke", stylers: [{ color: "#0F4C5C" }, { weight: 2 }] },
    
    // POI - Subtle styling on dark background
    { featureType: "poi", elementType: "geometry.fill", stylers: [{ color: "#14545F" }] },
    { featureType: "poi.business", stylers: [{ visibility: "off" }] },
    { featureType: "poi.medical", elementType: "geometry.fill", stylers: [{ color: "#00A6A6" }] },
    
    // Transit - Mid-tone teal
    { featureType: "transit", elementType: "geometry.fill", stylers: [{ color: "#1A5F6F" }] },
    
    // Administrative boundaries
    { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#00A6A6" }, { weight: 0.5 }] },
  ];

  // Initialize map
  useEffect(() => {
    if (loading || error || !mapRef.current || !window.google?.maps) return;

    // Use user location if available, otherwise default to Toronto
    const defaultCenter = userLocation 
      ? { lat: userLocation.lat, lng: userLocation.lng }
      : { lat: 43.65107, lng: -79.347015 };
    
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: userLocation ? 12 : 10,
      styles: brandMapStyles,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
  }, [loading, error, userLocation]);

  // Update markers when doctors change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (doctors.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    doctors.forEach((doctor) => {
      const position = { lat: doctor.latitude, lng: doctor.longitude };
      bounds.extend(position);

      const isSelected = selectedDoctorId === doctor.id;
      const markerColor = statusColors[doctor.acceptingStatus] || statusColors.unknown;

      // Create SVG icon for the marker
      const size = isSelected ? 40 : 32;
      const svgIcon = {
        url: `data:image/svg+xml,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${markerColor}" stroke="${isSelected ? '#0F4C5C' : 'white'}" stroke-width="3"/>
          </svg>
        `)}`,
        scaledSize: new window.google.maps.Size(size, size),
        anchor: new window.google.maps.Point(size/2, size/2),
      };

      const marker = new window.google.maps.Marker({
        map: mapInstanceRef.current,
        position,
        icon: svgIcon,
        title: doctor.fullName,
        zIndex: isSelected ? 100 : 1,
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
      <div className={`flex items-center justify-center bg-background-alt ${className}`}>
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-background-alt ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapRef} className={`w-full ${className}`} />
  );
}

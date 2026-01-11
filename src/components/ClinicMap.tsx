import { useEffect, useRef, useState, memo } from "react";
import { Clinic } from "@/lib/clinics";
import { Loader2, MapPin, ExternalLink, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface ClinicMapProps {
  clinics: Clinic[];
  selectedClinicId?: string;
  onClinicSelect?: (clinicId: string) => void;
  userLocation?: { lat: number; lng: number } | null;
  searchLocation?: { lat: number; lng: number } | null;
  searchRadius?: number; // in kilometers
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

const ClinicMap = memo(function ClinicMap({ 
  clinics, 
  selectedClinicId, 
  onClinicSelect, 
  userLocation, 
  searchLocation,
  searchRadius = 10,
  className = "" 
}: ClinicMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const infoCardRef = useRef<HTMLDivElement | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

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

  // Update radius circle
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps || !searchLocation) return;

    // Remove existing circle
    if (circleRef.current) {
      circleRef.current.setMap(null);
    }

    // Create new circle
    const circle = new window.google.maps.Circle({
      map: mapInstanceRef.current,
      center: searchLocation,
      radius: searchRadius * 1000, // Convert km to meters
      fillColor: '#FDB813', // Light orange/gold
      fillOpacity: 0.15,
      strokeColor: '#FDB813',
      strokeOpacity: 0.4,
      strokeWeight: 2,
    });

    circleRef.current = circle;

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
      }
    };
  }, [searchLocation, searchRadius]);

  // Update markers when clinics change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (clinics.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    // Group clinics by location to detect overlaps
    const locationGroups = new Map<string, Clinic[]>();
    clinics.forEach((clinic) => {
      const key = `${clinic.latitude.toFixed(6)},${clinic.longitude.toFixed(6)}`;
      if (!locationGroups.has(key)) {
        locationGroups.set(key, []);
      }
      locationGroups.get(key)!.push(clinic);
    });

    clinics.forEach((clinic) => {
      const key = `${clinic.latitude.toFixed(6)},${clinic.longitude.toFixed(6)}`;
      const group = locationGroups.get(key)!;
      
      // If multiple clinics at same location, offset them in a visible circle
      let position = { lat: clinic.latitude, lng: clinic.longitude };
      if (group.length > 1) {
        const index = group.indexOf(clinic);
        const angle = (index / group.length) * 2 * Math.PI;
        const offset = 0.002; // ~200 meters offset - clearly visible at normal zoom
        position = {
          lat: clinic.latitude + (Math.cos(angle) * offset),
          lng: clinic.longitude + (Math.sin(angle) * offset),
        };
      }
      
      bounds.extend(position);

      const isSelected = selectedClinicId === clinic.id;
      const markerColor = statusColors[clinic.acceptingStatus] || statusColors.unknown;

      // Create SVG icon for the marker - pin shape with medical cross
      const size = isSelected ? 50 : 40;
      const svgIcon = {
        url: `data:image/svg+xml,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.33}" viewBox="-2 -2 28 36">
            <!-- Pin shape -->
            <path d="M12 0C5.4 0 0 5.4 0 12c0 8 12 20 12 20s12-12 12-20c0-6.6-5.4-12-12-12z" 
                  fill="${markerColor}" 
                  stroke="${isSelected ? '#0F4C5C' : markerColor}" 
                  stroke-width="${isSelected ? '2' : '0'}"/>
            <!-- Medical cross -->
            <rect x="10" y="6" width="4" height="12" fill="white" rx="0.5"/>
            <rect x="6" y="10" width="12" height="4" fill="white" rx="0.5"/>
          </svg>
        `)}`,
        scaledSize: new window.google.maps.Size(size, size * 1.33),
        anchor: new window.google.maps.Point(size/2, size * 1.33),
      };

      // Higher zIndex for: 1) Selected markers, 2) Accepting clinics, 3) Others
      let zIndex = 1;
      if (isSelected) {
        zIndex = 100;
      } else if (clinic.acceptingStatus === 'accepting') {
        zIndex = 10;
      } else if (clinic.acceptingStatus === 'waitlist') {
        zIndex = 5;
      }

      const marker = new window.google.maps.Marker({
        map: mapInstanceRef.current,
        position,
        icon: svgIcon,
        title: `${clinic.name} - ${clinic.acceptingStatus}`,
        zIndex,
        optimized: false, // Better rendering for overlapping markers
      });

      marker.addListener("click", () => {
        setSelectedClinic(clinic);
        onClinicSelect?.(clinic.id);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds with padding
    if (clinics.length > 0 || searchLocation) {
      mapInstanceRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 100, left: 50 });
      
      // Limit max zoom
      const listener = window.google.maps.event.addListener(mapInstanceRef.current, "idle", () => {
        const zoom = mapInstanceRef.current?.getZoom();
        if (zoom && zoom > 15) {
          mapInstanceRef.current?.setZoom(15);
        }
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [clinics, selectedClinicId, onClinicSelect, searchLocation]);

  // Close info card when clicking on map
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps) return;

    const listener = window.google.maps.event.addListener(mapInstanceRef.current, "click", () => {
      setSelectedClinic(null);
    });

    return () => {
      window.google.maps.event.removeListener(listener);
    };
  }, []);

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
    <div className="relative w-full">
      <div ref={mapRef} className={`w-full ${className}`} />
      
      {/* Custom Info Card Overlay */}
      {selectedClinic && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 w-11/12 max-w-md">
          <div className="bg-background border-2 border-secondary rounded-lg shadow-2xl p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {selectedClinic.name}
                </h3>
                <StatusBadge status={selectedClinic.acceptingStatus} size="sm" />
              </div>
              <button
                onClick={() => setSelectedClinic(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              {selectedClinic.address}, {selectedClinic.city}
            </p>
            
            <div className="flex gap-2">
              <Button size="sm" asChild className="flex-1">
                <Link to={`/clinics/${selectedClinic.id}`}>
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Details
                </Link>
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                asChild
              >
                <a href={`tel:${selectedClinic.phone.replace(/[^0-9]/g, "")}`}>
                  Call Clinic
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export { ClinicMap };

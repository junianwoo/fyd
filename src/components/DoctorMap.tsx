import { useEffect, useRef, useState, memo } from "react";
import { Doctor } from "@/lib/doctors";
import { Loader2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DoctorMapProps {
  doctors: Doctor[];
  selectedDoctorId?: string;
  onDoctorSelect?: (doctorId: string) => void;
  userLocation?: { lat: number; lng: number } | null;
  searchLocation?: { lat: number; lng: number } | null;
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

const DoctorMap = memo(function DoctorMap({ doctors, selectedDoctorId, onDoctorSelect, userLocation, searchLocation, className = "" }: DoctorMapProps) {
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

    // Group doctors by location to detect overlaps
    const locationGroups = new Map<string, Doctor[]>();
    doctors.forEach((doctor) => {
      const key = `${doctor.latitude.toFixed(6)},${doctor.longitude.toFixed(6)}`;
      if (!locationGroups.has(key)) {
        locationGroups.set(key, []);
      }
      locationGroups.get(key)!.push(doctor);
    });

    doctors.forEach((doctor) => {
      const key = `${doctor.latitude.toFixed(6)},${doctor.longitude.toFixed(6)}`;
      const group = locationGroups.get(key)!;
      
      // If multiple doctors at same location, offset them in a small circle
      let position = { lat: doctor.latitude, lng: doctor.longitude };
      if (group.length > 1) {
        const index = group.indexOf(doctor);
        const angle = (index / group.length) * 2 * Math.PI;
        const offset = 0.0003; // ~30 meters offset
        position = {
          lat: doctor.latitude + (Math.cos(angle) * offset),
          lng: doctor.longitude + (Math.sin(angle) * offset),
        };
      }
      
      bounds.extend(position);

      const isSelected = selectedDoctorId === doctor.id;
      const markerColor = statusColors[doctor.acceptingStatus] || statusColors.unknown;

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

      // Higher zIndex for: 1) Selected markers, 2) Accepting doctors, 3) Others
      let zIndex = 1;
      if (isSelected) {
        zIndex = 100;
      } else if (doctor.acceptingStatus === 'accepting') {
        zIndex = 10;
      } else if (doctor.acceptingStatus === 'waitlist') {
        zIndex = 5;
      }

      const marker = new window.google.maps.Marker({
        map: mapInstanceRef.current,
        position,
        icon: svgIcon,
        title: `${doctor.fullName} - ${doctor.acceptingStatus}`,
        zIndex,
        optimized: false, // Better rendering for overlapping markers
      });

      marker.addListener("click", () => {
        onDoctorSelect?.(doctor.id);
      });

      markersRef.current.push(marker);
    });

    // Add search location marker if it exists and differs from user location
    if (searchLocation && 
        (!userLocation || 
         searchLocation.lat !== userLocation.lat || 
         searchLocation.lng !== userLocation.lng)) {
      
      bounds.extend(searchLocation);
      
      const searchMarkerSize = 45;
      const searchMarkerIcon = {
        url: `data:image/svg+xml,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="${searchMarkerSize}" height="${searchMarkerSize * 1.33}" viewBox="-2 -2 28 36">
            <!-- Pin shape in gold -->
            <path d="M12 0C5.4 0 0 5.4 0 12c0 8 12 20 12 20s12-12 12-20c0-6.6-5.4-12-12-12z" 
                  fill="#FDB813" 
                  stroke="#0F4C5C" 
                  stroke-width="2"/>
            <!-- Star icon -->
            <path d="M12 7l1.545 4.755h5l-4.045 2.94 1.545 4.755L12 16.51l-4.045 2.94 1.545-4.755-4.045-2.94h5z" 
                  fill="white"/>
          </svg>
        `)}`,
        scaledSize: new window.google.maps.Size(searchMarkerSize, searchMarkerSize * 1.33),
        anchor: new window.google.maps.Point(searchMarkerSize/2, searchMarkerSize * 1.33),
      };

      const searchMarker = new window.google.maps.Marker({
        map: mapInstanceRef.current,
        position: searchLocation,
        icon: searchMarkerIcon,
        title: "Your search location",
        zIndex: 50, // Above regular markers, below selected
      });

      markersRef.current.push(searchMarker);
    }

    // Fit bounds with padding
    if (doctors.length > 0 || searchLocation) {
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
  }, [doctors, selectedDoctorId, onDoctorSelect, searchLocation, userLocation]);

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
});

export { DoctorMap };

import { useEffect, useRef, useState, memo } from "react";
import { Clinic } from "@/lib/clinics";
import { Loader2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const shouldFitBoundsRef = useRef<boolean>(true); // Track if we should auto-fit bounds
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(12);
  
  // Calculate marker size category based on zoom level (to avoid recreating markers too frequently)
  const markerSizeCategory = mapZoom >= 16 ? 'small' : mapZoom >= 13 ? 'medium' : 'large';
  
  // Calculate marker size based on zoom level
  const getMarkerSize = (isSelected: boolean, zoom: number) => {
    // Base sizes
    const baseSize = isSelected ? 50 : 40;
    
    // Scale factor decreases as zoom increases (markers get smaller when zoomed in)
    // Zoom 10-12: normal size (1.0x)
    // Zoom 13-15: smaller (0.7x)
    // Zoom 16+: much smaller (0.5x)
    let scaleFactor = 1.0;
    if (zoom >= 16) {
      scaleFactor = 0.5;
    } else if (zoom >= 13) {
      scaleFactor = 0.7;
    }
    
    return Math.floor(baseSize * scaleFactor);
  };

  // Helper function to get status badge styling
  const getStatusBadgeStyles = (status: string): string => {
    switch (status) {
      case 'accepting':
        return 'background: #dcfce7; color: #166534;';
      case 'not_accepting':
        return 'background: #fee2e2; color: #991b1b;';
      case 'waitlist':
        return 'background: #fef3c7; color: #92400e;';
      case 'unknown':
      default:
        return 'background: #f3f4f6; color: #374151;';
    }
  };

  // Helper function to get formatted status text
  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      'accepting': 'Accepting Patients',
      'not_accepting': 'Not Accepting',
      'waitlist': 'Waitlist',
      'unknown': 'Unknown'
    };
    return statusMap[status] || 'Unknown';
  };

  // Create branded InfoWindow content
  const createInfoWindowContent = (clinic: Clinic): string => {
    return `
      <div style="
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 12px;
        width: 100%;
        max-width: 280px;
        box-sizing: border-box;
      ">
        <div style="margin-bottom: 10px;">
          <div style="
            display: inline-block;
            padding: 3px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 6px;
            ${getStatusBadgeStyles(clinic.acceptingStatus)}
          ">
            ${getStatusText(clinic.acceptingStatus)}
          </div>
          <h3 style="
            font-size: 16px;
            font-weight: 600;
            margin: 6px 0;
            color: #0F4C5C;
            line-height: 1.3;
            word-wrap: break-word;
            overflow-wrap: break-word;
          ">
            ${clinic.name}
          </h3>
        </div>
        
        <p style="
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 10px;
          line-height: 1.4;
          word-wrap: break-word;
          overflow-wrap: break-word;
        ">
          ${clinic.address}, ${clinic.city}
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <a 
            href="/clinics/${clinic.id}" 
            target="_blank"
            rel="noopener noreferrer"
            style="
              display: block;
              padding: 10px 12px;
              background: #0F4C5C;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 500;
              text-align: center;
              transition: background 0.2s;
              box-sizing: border-box;
            "
            onmouseover="this.style.background='#00A6A6'"
            onmouseout="this.style.background='#0F4C5C'"
          >
            View Details
          </a>
          <a 
            href="tel:${clinic.phone.replace(/[^0-9]/g, '')}"
            style="
              display: block;
              padding: 10px 12px;
              border: 1.5px solid #0F4C5C;
              border-radius: 6px;
              color: #0F4C5C;
              text-decoration: none;
              font-size: 14px;
              font-weight: 500;
              text-align: center;
              transition: all 0.2s;
              box-sizing: border-box;
              background: white;
            "
            onmouseover="this.style.background='#f0fdf4'; this.style.borderColor='#00A6A6'"
            onmouseout="this.style.background='white'; this.style.borderColor='#0F4C5C'"
          >
            Call Clinic
          </a>
        </div>
      </div>
    `;
  };

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

    // Use user location if available, otherwise default to center of Ontario
    const defaultCenter = userLocation 
      ? { lat: userLocation.lat, lng: userLocation.lng }
      : { lat: 44.0, lng: -79.5 };
    
    // Default zoom shows Ontario province view (no search yet)
    const defaultZoom = clinics.length > 0 ? 10 : 6;
    
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      styles: brandMapStyles,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      gestureHandling: 'cooperative', // Requires two-finger zoom on mobile for stability
      minZoom: 6, // Allow viewing all of Ontario
      maxZoom: 18, // Prevent extreme zoom in
    });

    // Initialize InfoWindow once
    infoWindowRef.current = new window.google.maps.InfoWindow({
      maxWidth: 280,
      disableAutoPan: false,
    });

    // Track zoom changes for responsive marker sizing (debounced to prevent interference with user gestures)
    let zoomTimeout: NodeJS.Timeout;
    mapInstanceRef.current.addListener('zoom_changed', () => {
      clearTimeout(zoomTimeout);
      zoomTimeout = setTimeout(() => {
        const zoom = mapInstanceRef.current?.getZoom();
        if (zoom !== undefined) {
          setMapZoom(zoom);
        }
      }, 150); // Debounce by 150ms to avoid recreating markers during active zoom gestures
    });
  }, [loading, error, userLocation]);

  // Update radius circle and center map on search location
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

    // Center map on search location
    mapInstanceRef.current.setCenter(searchLocation);
    mapInstanceRef.current.setZoom(12);

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
      // Size is now responsive to zoom level
      const size = getMarkerSize(isSelected, mapZoom);
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
        optimized: true, // Use optimized rendering for better mobile performance
      });

      marker.addListener("click", () => {
        // Open InfoWindow with branded content
        if (infoWindowRef.current && mapInstanceRef.current) {
          const content = createInfoWindowContent(clinic);
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open({
            anchor: marker,
            map: mapInstanceRef.current,
          });
          
          // Pan map to show marker and InfoWindow
          mapInstanceRef.current.panTo(position);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit bounds with padding - only on initial load or when clinics/search changes, not on zoom
    if ((clinics.length > 0 || searchLocation) && shouldFitBoundsRef.current) {
      mapInstanceRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 100, left: 50 });
      shouldFitBoundsRef.current = false; // Disable auto-fit after first time
    }
  }, [clinics, selectedClinicId, onClinicSelect, searchLocation, markerSizeCategory]);
  
  // Reset shouldFitBounds when clinics or search location changes (but not on zoom)
  useEffect(() => {
    shouldFitBoundsRef.current = true;
  }, [clinics, searchLocation]);


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
    </div>
  );
});

export { ClinicMap };

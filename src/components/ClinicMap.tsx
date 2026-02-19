'use client'
import { useEffect, useRef, useState, useCallback, memo } from "react";
import { Map as GoogleMap, useMap, InfoWindow } from "@vis.gl/react-google-maps";
import { Clinic } from "@/lib/clinics";
import { MapPin } from "lucide-react";

interface ClinicMapProps {
  clinics: Clinic[];
  selectedClinicId?: string;
  onClinicSelect?: (clinicId: string) => void;
  userLocation?: { lat: number; lng: number } | null;
  searchLocation?: { lat: number; lng: number } | null;
  searchRadius?: number;
  className?: string;
}

const statusColors: Record<string, string> = {
  accepting: "#22c55e",
  not_accepting: "#dc2626",
  waitlist: "#F4A261",
  unknown: "#6b7280",
};

const brandMapStyles: google.maps.MapTypeStyle[] = [
  { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#00A6A6" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "landscape", elementType: "geometry.fill", stylers: [{ color: "#0F4C5C" }] },
  { featureType: "landscape.natural", elementType: "geometry.fill", stylers: [{ color: "#0D4350" }] },
  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#1A5F6F" }] },
  { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#B8E0DD" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#00A6A6" }, { weight: 0.5 }] },
  { featureType: "road.arterial", elementType: "geometry.fill", stylers: [{ color: "#A8D8D5" }] },
  { featureType: "road.local", elementType: "geometry.fill", stylers: [{ color: "#98D0CC" }] },
  { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#F3FBFA" }] },
  { featureType: "all", elementType: "labels.text.stroke", stylers: [{ color: "#0F4C5C" }, { weight: 2 }] },
  { featureType: "poi", elementType: "geometry.fill", stylers: [{ color: "#14545F" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", elementType: "geometry.fill", stylers: [{ color: "#00A6A6" }] },
  { featureType: "transit", elementType: "geometry.fill", stylers: [{ color: "#1A5F6F" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#00A6A6" }, { weight: 0.5 }] },
];

function getStatusBadgeStyles(status: string): string {
  switch (status) {
    case "accepting": return "background: #dcfce7; color: #166534;";
    case "not_accepting": return "background: #fee2e2; color: #991b1b;";
    case "waitlist": return "background: #fef3c7; color: #92400e;";
    default: return "background: #f3f4f6; color: #374151;";
  }
}

function getStatusText(status: string): string {
  const map: Record<string, string> = {
    accepting: "Accepting Patients",
    not_accepting: "Not Accepting",
    waitlist: "Waitlist",
    unknown: "Unknown",
  };
  return map[status] || "Unknown";
}

function getMarkerSize(isSelected: boolean, zoom: number): number {
  const base = isSelected ? 50 : 40;
  let scale = 1.0;
  if (zoom >= 16) scale = 1.6;
  else if (zoom >= 14) scale = 1.3;
  else if (zoom >= 12) scale = 1.0;
  else if (zoom >= 10) scale = 0.8;
  else scale = 0.65;
  return Math.floor(base * scale);
}

function ClinicMapInner({
  clinics,
  selectedClinicId,
  onClinicSelect,
  searchLocation,
  searchRadius = 10,
}: Omit<ClinicMapProps, "className" | "userLocation">) {
  const map = useMap();
  const markersRef = useRef<google.maps.Marker[]>([]);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const shouldFitBoundsRef = useRef<boolean>(true);
  const [mapZoom, setMapZoom] = useState(12);
  const markerSizeCategory = mapZoom >= 16 ? "xl" : mapZoom >= 14 ? "large" : mapZoom >= 12 ? "medium" : mapZoom >= 10 ? "small" : "xs";

  const [infoClinic, setInfoClinic] = useState<Clinic | null>(null);
  const [infoPosition, setInfoPosition] = useState<google.maps.LatLngLiteral | null>(null);

  useEffect(() => {
    if (!map) return;
    let zoomTimeout: ReturnType<typeof setTimeout>;
    const listener = map.addListener("zoom_changed", () => {
      clearTimeout(zoomTimeout);
      zoomTimeout = setTimeout(() => {
        const z = map.getZoom();
        if (z !== undefined) setMapZoom(z);
      }, 150);
    });
    return () => {
      google.maps.event.removeListener(listener);
      clearTimeout(zoomTimeout);
    };
  }, [map]);

  useEffect(() => {
    if (!map || !searchLocation) return;
    circleRef.current?.setMap(null);
    circleRef.current = new google.maps.Circle({
      map,
      center: searchLocation,
      radius: searchRadius * 1000,
      fillColor: "#FDB813",
      fillOpacity: 0.15,
      strokeColor: "#FDB813",
      strokeOpacity: 0.4,
      strokeWeight: 2,
    });
    map.setCenter(searchLocation);
    map.setZoom(12);
    return () => { circleRef.current?.setMap(null); };
  }, [map, searchLocation, searchRadius]);

  useEffect(() => { shouldFitBoundsRef.current = true; }, [clinics, searchLocation]);

  const handleMarkerClick = useCallback((clinic: Clinic, position: google.maps.LatLngLiteral) => {
    setInfoClinic(clinic);
    setInfoPosition(position);
    map?.panTo(position);
    onClinicSelect?.(clinic.id);

  }, [map, onClinicSelect]);

  useEffect(() => {
    if (!map) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (clinics.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    const locationGroups = new Map<string, Clinic[]>();
    clinics.forEach((c) => {
      const key = `${c.latitude.toFixed(6)},${c.longitude.toFixed(6)}`;
      if (!locationGroups.has(key)) locationGroups.set(key, []);
      locationGroups.get(key)!.push(c);
    });

    clinics.forEach((clinic) => {
      const key = `${clinic.latitude.toFixed(6)},${clinic.longitude.toFixed(6)}`;
      const group = locationGroups.get(key)!;
      let position = { lat: clinic.latitude, lng: clinic.longitude };
      if (group.length > 1) {
        const idx = group.indexOf(clinic);
        const angle = (idx / group.length) * 2 * Math.PI;
        const offset = 0.0003;
        position = { lat: clinic.latitude + Math.cos(angle) * offset, lng: clinic.longitude + Math.sin(angle) * offset };
      }
      bounds.extend(position);

      const isSelected = selectedClinicId === clinic.id;
      const color = statusColors[clinic.acceptingStatus] || statusColors.unknown;
      const size = getMarkerSize(isSelected, mapZoom);

      const svgIcon = {
        url: `data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.33}" viewBox="-2 -2 28 36">
            <path d="M12 0C5.4 0 0 5.4 0 12c0 8 12 20 12 20s12-12 12-20c0-6.6-5.4-12-12-12z"
                  fill="${color}" stroke="${isSelected ? "#0F4C5C" : color}" stroke-width="${isSelected ? 2 : 0}"/>
            <rect x="10" y="6" width="4" height="12" fill="white" rx="0.5"/>
            <rect x="6" y="10" width="12" height="4" fill="white" rx="0.5"/>
          </svg>`
        )}`,
        scaledSize: new google.maps.Size(size, size * 1.33),
        anchor: new google.maps.Point(size / 2, size * 1.33),
      };

      const marker = new google.maps.Marker({
        map,
        position,
        icon: svgIcon,
        title: `${clinic.name} - ${clinic.acceptingStatus}`,
        zIndex: isSelected ? 100 : clinic.acceptingStatus === "accepting" ? 10 : clinic.acceptingStatus === "waitlist" ? 5 : 1,
        optimized: false,
      });

      marker.addListener("click", () => handleMarkerClick(clinic, position));
      markersRef.current.push(marker);
    });

    if (clinics.length > 0 && shouldFitBoundsRef.current) {
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 100, left: 50 });
      shouldFitBoundsRef.current = false;
    }
  }, [map, clinics, selectedClinicId, onClinicSelect, searchLocation, markerSizeCategory, handleMarkerClick]);

  return infoClinic && infoPosition ? (
    <InfoWindow
      position={infoPosition}
      onCloseClick={() => setInfoClinic(null)}
    >
      <div style={{ fontFamily: "system-ui, sans-serif", padding: "4px", maxWidth: 280 }}>
        <div style={{ marginBottom: 10 }}>
          <span
            style={{
              display: "inline-block",
              padding: "3px 10px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              marginBottom: 6,
              ...parseInlineStyles(getStatusBadgeStyles(infoClinic.acceptingStatus)),
            }}
          >
            {getStatusText(infoClinic.acceptingStatus)}
          </span>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: "6px 0", color: "#0F4C5C", lineHeight: 1.3 }}>
            {infoClinic.name}
          </h3>
        </div>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 10 }}>
          {infoClinic.address}, {infoClinic.city}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <a
            href={`/clinics/${infoClinic.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block", padding: "10px 12px", background: "#0F4C5C", color: "white",
              textDecoration: "none", borderRadius: 6, fontSize: 14, fontWeight: 500, textAlign: "center",
            }}
          >
            View Details
          </a>
          <a
            href={`tel:${infoClinic.phone.replace(/[^0-9]/g, "")}`}
            style={{
              display: "block", padding: "10px 12px", border: "1.5px solid #0F4C5C",
              borderRadius: 6, color: "#0F4C5C", textDecoration: "none", fontSize: 14,
              fontWeight: 500, textAlign: "center", background: "white",
            }}
          >
            Call Clinic
          </a>
        </div>
      </div>
    </InfoWindow>
  ) : null;
}

function parseInlineStyles(css: string): Record<string, string> {
  const result: Record<string, string> = {};
  css.split(";").forEach((rule) => {
    const [key, value] = rule.split(":").map((s) => s.trim());
    if (key && value) {
      const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      result[camelKey] = value;
    }
  });
  return result;
}

const ClinicMap = memo(function ClinicMap({
  clinics,
  selectedClinicId,
  onClinicSelect,
  userLocation,
  searchLocation,
  searchRadius = 10,
  className = "",
}: ClinicMapProps) {
  const defaultCenter = userLocation ?? { lat: 44.0, lng: -79.5 };
  const defaultZoom = clinics.length > 0 ? 10 : 6;

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className={`flex items-center justify-center bg-background-alt ${className}`}>
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Google Maps API key is not configured.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <GoogleMap
        defaultCenter={defaultCenter}
        defaultZoom={defaultZoom}
        styles={brandMapStyles}
        disableDefaultUI={false}
        zoomControl={true}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={true}
        gestureHandling="cooperative"
        minZoom={6}
        maxZoom={18}
        style={{ width: "100%", height: "100%" }}
      >
        <ClinicMapInner
          clinics={clinics}
          selectedClinicId={selectedClinicId}
          onClinicSelect={onClinicSelect}
          searchLocation={searchLocation}
          searchRadius={searchRadius}
        />
      </GoogleMap>
    </div>
  );
});

export { ClinicMap };

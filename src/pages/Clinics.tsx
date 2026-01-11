import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { MapPin, Phone, Calendar, ExternalLink, Loader2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ClinicMap } from "@/components/ClinicMap";
import { MapLegend } from "@/components/MapLegend";
import { ClinicFilters } from "@/components/ClinicFilters";
import { LocationPrompt } from "@/components/LocationPrompt";
import { ClinicPagination } from "@/components/ClinicPagination";
import { ClinicEmptyState } from "@/components/ClinicEmptyState";
import { searchClinics, Clinic, ClinicStatus } from "@/lib/clinics";
import { useUserStatus } from "@/hooks/useUserStatus";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const CLINICS_PER_PAGE = 30;

export default function Clinics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("search") || "";
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number } | null>(null);

  // We keep input separate from the "active" query to avoid firing searches on every keystroke
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);

  const [statusFilter, setStatusFilter] = useState<ClinicStatus | "all">("all");
  const [distanceFilter, setDistanceFilter] = useState("10"); // Default to 10km
  const [languageFilter, setLanguageFilter] = useState<string[]>([]);
  const [accessibilityFilter, setAccessibilityFilter] = useState(false);
  const [virtualFilter, setVirtualFilter] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinicId, setSelectedClinicId] = useState<string | undefined>();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const searchRequestIdRef = useRef(0);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // User status for advanced filters
  const { isPaidUser } = useUserStatus();

  // Keep state in sync with URL (e.g., back/forward navigation)
  useEffect(() => {
    setSearchInput(initialQuery);
    setActiveQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (!userLocation) return;

    // Only search when there's a query - show empty state otherwise
    if (!activeQuery.trim()) {
      setClinics([]);
      setSearchLocation(null);
      setLoading(false);
      return;
    }

    const requestId = ++searchRequestIdRef.current;

    const loadClinics = async () => {
      setLoading(true);
      const result = await searchClinics(activeQuery);

      // Ignore out-of-order responses
      if (requestId !== searchRequestIdRef.current) return;

      setClinics(result.clinics);
      setSearchLocation(result.searchLocation);
      setLoading(false);
    };

    loadClinics();
  }, [activeQuery, userLocation]);

  // Use search location when a search is performed, otherwise use user location
  const filterCenter = activeQuery.trim() && searchLocation ? searchLocation : userLocation;

  // Sort clinics by distance and apply filters
  const filteredClinics = useMemo(() => {
    let result = clinics;

    // Calculate distance and filter by distance if set
    if (filterCenter) {
      // Add distance to each clinic for filtering/sorting
      result = result.map((clinic) => ({
        ...clinic,
        distance: calculateDistance(filterCenter.lat, filterCenter.lng, clinic.latitude, clinic.longitude),
      }));

      // Filter by distance
      if (distanceFilter !== "any") {
        const maxDistance = parseInt(distanceFilter, 10);
        result = result.filter((clinic) => (clinic as any).distance <= maxDistance);
      }

      // Sort by distance
      result = [...result].sort((a, b) => (a as any).distance - (b as any).distance);
    }

    // Status filter
    if (statusFilter && statusFilter !== "all") {
      result = result.filter((clinic) => clinic.acceptingStatus === statusFilter);
    }

    // Language filter
    if (languageFilter.length > 0) {
      result = result.filter((clinic) =>
        languageFilter.some((lang) => clinic.languages.includes(lang))
      );
    }

    // Accessibility filter
    if (accessibilityFilter) {
      result = result.filter((clinic) => clinic.accessibilityFeatures.length > 0);
    }

    // Virtual appointments filter
    if (virtualFilter) {
      result = result.filter((clinic) => clinic.virtualAppointments);
    }

    return result;
  }, [clinics, filterCenter, statusFilter, distanceFilter, languageFilter, accessibilityFilter, virtualFilter]);

  // Paginated clinics for display
  const paginatedClinics = useMemo(() => {
    const startIndex = (currentPage - 1) * CLINICS_PER_PAGE;
    return filteredClinics.slice(startIndex, startIndex + CLINICS_PER_PAGE);
  }, [filteredClinics, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, distanceFilter, languageFilter, accessibilityFilter, virtualFilter, activeQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = searchInput.trim();
    setActiveQuery(next);

    if (next) {
      setSearchParams({ search: next });
    } else {
      setSearchParams({});
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleClinicSelect = useCallback((clinicId: string) => {
    setSelectedClinicId(clinicId);
    const element = document.getElementById(`clinic-${clinicId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const clearFilters = () => {
    setStatusFilter("all");
    setDistanceFilter("10"); // Reset to default 10km
    setLanguageFilter([]);
    setAccessibilityFilter(false);
    setVirtualFilter(false);
  };

  // Show all filtered clinics on map (no limit)
  const mapClinics = filteredClinics;

  // Show location prompt if user hasn't shared location yet
  if (!userLocation) {
    return (
      <div className="min-h-screen bg-background">
        <LocationPrompt onLocationGranted={setUserLocation} />
      </div>
    );
  }

  const hasSearched = activeQuery.trim().length > 0;
  
  // Get radius in km as number for map circle
  const radiusKm = distanceFilter !== "any" ? parseInt(distanceFilter, 10) : 50; // Default to 50km if "any"

  const FiltersContent = (
    <ClinicFilters
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      distanceFilter={distanceFilter}
      onDistanceFilterChange={setDistanceFilter}
      languageFilter={languageFilter}
      onLanguageFilterChange={setLanguageFilter}
      accessibilityFilter={accessibilityFilter}
      onAccessibilityFilterChange={setAccessibilityFilter}
      virtualFilter={virtualFilter}
      onVirtualFilterChange={setVirtualFilter}
      onClearFilters={clearFilters}
      isPaidUser={isPaidUser}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Map Section */}
      <div className="bg-background-alt border-b border-border">
        <ClinicMap 
          clinics={mapClinics} 
          selectedClinicId={selectedClinicId}
          onClinicSelect={handleClinicSelect}
          userLocation={userLocation}
          searchLocation={searchLocation}
          searchRadius={radiusKm}
          className="h-[550px] md:h-[650px]"
        />
      </div>

      {/* Map Legend - Below map, outside */}
      <div className="bg-background border-b border-border py-3">
        <div className="max-w-5xl mx-auto px-4">
          <MapLegend />
        </div>
      </div>

      {/* Search Bar */}
      <div className="sticky top-16 z-40 bg-background border-b border-border shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
          <form onSubmit={handleSearch} className="flex gap-3 md:gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="City or postal code"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-14 md:h-16 text-base md:text-lg px-4 md:px-6"
              />
            </div>
            <Button type="submit" className="h-14 md:h-16 px-6 md:px-8 text-base md:text-lg font-semibold">
              Search
            </Button>
            {/* Mobile Filter Toggle */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-14 w-14 lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-6">
                {FiltersContent}
              </SheetContent>
            </Sheet>
          </form>
        </div>
      </div>

      {/* Main Content - 20/80 Split */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Column - Filters (Desktop Only) */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-44">
              {FiltersContent}
            </div>
          </aside>

          {/* Right Column - Results */}
          <div className="flex-1 min-w-0">
            {/* Header with pagination - only show when there are results */}
            {hasSearched && (
              <div className="flex items-center justify-between mb-6">
                {loading ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching clinics...
                  </span>
                ) : (
                  <ClinicPagination
                    currentPage={currentPage}
                    totalItems={filteredClinics.length}
                    itemsPerPage={CLINICS_PER_PAGE}
                    onPageChange={setCurrentPage}
                  />
                )}
              </div>
            )}

            {/* Empty state - show when no search has been performed */}
            {!hasSearched && !loading && (
              <ClinicEmptyState />
            )}

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-secondary" />
              </div>
            ) : hasSearched && (
              <div className="grid gap-4">
                {paginatedClinics.map((clinic) => (
                  <Card 
                    key={clinic.id} 
                    id={`clinic-${clinic.id}`}
                    className={`overflow-hidden hover:shadow-md transition-all cursor-pointer ${
                      selectedClinicId === clinic.id ? "ring-2 ring-secondary shadow-lg" : ""
                    }`}
                    onClick={() => setSelectedClinicId(clinic.id)}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Status Badge - Mobile */}
                        <div className="p-4 md:hidden">
                          <StatusBadge status={clinic.acceptingStatus} />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 p-4 md:p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg text-foreground font-semibold">
                                  {clinic.name}
                                </h3>
                                {/* Status Badge - Desktop */}
                                <div className="hidden md:block">
                                  <StatusBadge status={clinic.acceptingStatus} size="sm" />
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="h-4 w-4 flex-shrink-0" />
                                  <span>{clinic.address}, {clinic.city}, {clinic.province} {clinic.postalCode}</span>
                                </div>
                                <a 
                                  href={`tel:${clinic.phone.replace(/[^0-9]/g, "")}`}
                                  className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Phone className="h-4 w-4 flex-shrink-0" />
                                  <span>{clinic.phone}</span>
                                </a>
                              </div>

                              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Updated {formatDate(clinic.statusLastUpdatedAt)}</span>
                                </div>
                                <span>
                                  Verified by {clinic.statusVerifiedBy === "clinic" ? "Clinic ✓" : "Community"}
                                </span>
                              </div>
                            </div>

                            <div className="hidden md:block">
                              <Button variant="outline" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                                <Link to={`/clinics/${clinic.id}`}>
                                  View Details
                                  <ExternalLink className="h-3 w-3 ml-2" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Mobile View Details Button */}
                        <div className="p-4 pt-0 md:hidden">
                          <Button variant="outline" className="w-full" asChild onClick={(e) => e.stopPropagation()}>
                            <Link to={`/clinics/${clinic.id}`}>
                              View Clinic Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredClinics.length === 0 && !loading && (
                  <div className="text-center py-16">
                    <p className="text-lg text-muted-foreground mb-4">
                      No clinics found matching your search.
                    </p>
                    <Button variant="outline" onClick={() => {
                      setSearchInput("");
                      setActiveQuery("");
                      clearFilters();
                      setSearchParams({});
                    }}>
                      Clear Filters
                    </Button>
                  </div>
                )}

                {/* Bottom pagination */}
                {filteredClinics.length > CLINICS_PER_PAGE && (
                  <div className="flex justify-end pt-4">
                    <ClinicPagination
                      currentPage={currentPage}
                      totalItems={filteredClinics.length}
                      itemsPerPage={CLINICS_PER_PAGE}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Bottom CTA */}
            <div className="mt-12 p-8 bg-background-alt rounded-xl text-center">
              <h3 className="text-xl text-foreground mb-2">
                Not finding what you need?
              </h3>
              <p className="text-muted-foreground mb-6">
                Get email alerts when clinics in your area begin accepting patients.
              </p>
              <Button asChild>
                <Link to="/pricing">See Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

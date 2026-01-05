import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { MapPin, Phone, Calendar, ExternalLink, Loader2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DoctorMap } from "@/components/DoctorMap";
import { MapLegend } from "@/components/MapLegend";
import { DoctorFilters } from "@/components/DoctorFilters";
import { LocationPrompt } from "@/components/LocationPrompt";
import { DoctorPagination } from "@/components/DoctorPagination";
import { DoctorEmptyState } from "@/components/DoctorEmptyState";
import { searchDoctors, Doctor, DoctorStatus } from "@/lib/doctors";
import { useUserStatus } from "@/hooks/useUserStatus";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const DOCTORS_PER_PAGE = 30;

export default function Doctors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("search") || "";
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<DoctorStatus | "all">("all");
  const [distanceFilter, setDistanceFilter] = useState("any");
  const [languageFilter, setLanguageFilter] = useState<string[]>([]);
  const [accessibilityFilter, setAccessibilityFilter] = useState(false);
  const [virtualFilter, setVirtualFilter] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    if (!userLocation) return;
    
    // Only search when there's a query - show empty state otherwise
    if (!searchQuery.trim()) {
      setDoctors([]);
      setSearchLocation(null);
      setLoading(false);
      return;
    }
    
    const loadDoctors = async () => {
      setLoading(true);
      const result = await searchDoctors(searchQuery);
      setDoctors(result.doctors);
      setSearchLocation(result.searchLocation);
      setLoading(false);
    };
    loadDoctors();
  }, [searchQuery, userLocation]);

  // Use search location when a search is performed, otherwise use user location
  const filterCenter = searchQuery.trim() && searchLocation ? searchLocation : userLocation;

  // Sort doctors by distance and apply filters
  const filteredDoctors = useMemo(() => {
    let result = doctors;

    // Calculate distance and filter by distance if set
    if (filterCenter) {
      // Add distance to each doctor for filtering/sorting
      result = result.map((doctor) => ({
        ...doctor,
        distance: calculateDistance(filterCenter.lat, filterCenter.lng, doctor.latitude, doctor.longitude),
      }));

      // Filter by distance
      if (distanceFilter !== "any") {
        const maxDistance = parseInt(distanceFilter, 10);
        result = result.filter((doctor) => (doctor as any).distance <= maxDistance);
      }

      // Sort by distance
      result = [...result].sort((a, b) => (a as any).distance - (b as any).distance);
    }

    // Status filter
    if (statusFilter && statusFilter !== "all") {
      result = result.filter((doctor) => doctor.acceptingStatus === statusFilter);
    }

    // Language filter
    if (languageFilter.length > 0) {
      result = result.filter((doctor) =>
        languageFilter.some((lang) => doctor.languages.includes(lang))
      );
    }

    // Accessibility filter
    if (accessibilityFilter) {
      result = result.filter((doctor) => doctor.accessibilityFeatures.length > 0);
    }

    // Virtual appointments filter
    if (virtualFilter) {
      result = result.filter((doctor) => doctor.virtualAppointments);
    }

    return result;
  }, [doctors, filterCenter, statusFilter, distanceFilter, languageFilter, accessibilityFilter, virtualFilter]);

  // Paginated doctors for display
  const paginatedDoctors = useMemo(() => {
    const startIndex = (currentPage - 1) * DOCTORS_PER_PAGE;
    return filteredDoctors.slice(startIndex, startIndex + DOCTORS_PER_PAGE);
  }, [filteredDoctors, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, distanceFilter, languageFilter, accessibilityFilter, virtualFilter, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery.trim() });
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

  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    const element = document.getElementById(`doctor-${doctorId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setDistanceFilter("any");
    setLanguageFilter([]);
    setAccessibilityFilter(false);
    setVirtualFilter(false);
  };

  // Show location prompt if user hasn't shared location yet
  if (!userLocation) {
    return (
      <div className="min-h-screen bg-background">
        <LocationPrompt onLocationGranted={setUserLocation} />
      </div>
    );
  }

  const hasSearched = searchQuery.trim().length > 0;

  const FiltersContent = (
    <DoctorFilters
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
        <DoctorMap 
          doctors={paginatedDoctors} 
          selectedDoctorId={selectedDoctorId}
          onDoctorSelect={handleDoctorSelect}
          userLocation={userLocation}
          className="h-96 md:h-[30rem]"
        />
      </div>

      {/* Map Legend - Below map, outside */}
      <div className="bg-background border-b border-border py-3">
        <div className="max-w-5xl mx-auto px-4">
          <MapLegend />
        </div>
      </div>

      {/* Search Bar */}
      <div className="sticky top-16 z-40 bg-background border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="City, postal code, or doctor name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11"
              />
            </div>
            <Button type="submit" className="h-11">
              Search
            </Button>
            {/* Mobile Filter Toggle */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-11 w-11 lg:hidden">
                  <Menu className="h-5 w-5" />
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
            <div className="sticky top-36">
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
                    Searching doctors...
                  </span>
                ) : (
                  <DoctorPagination
                    currentPage={currentPage}
                    totalItems={filteredDoctors.length}
                    itemsPerPage={DOCTORS_PER_PAGE}
                    onPageChange={setCurrentPage}
                  />
                )}
              </div>
            )}

            {/* Empty state - show when no search has been performed */}
            {!hasSearched && !loading && (
              <DoctorEmptyState />
            )}

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-secondary" />
              </div>
            ) : hasSearched && (
              <div className="grid gap-4">
                {paginatedDoctors.map((doctor) => (
                  <Card 
                    key={doctor.id} 
                    id={`doctor-${doctor.id}`}
                    className={`overflow-hidden hover:shadow-md transition-all cursor-pointer ${
                      selectedDoctorId === doctor.id ? "ring-2 ring-secondary shadow-lg" : ""
                    }`}
                    onClick={() => setSelectedDoctorId(doctor.id)}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Status Badge - Mobile */}
                        <div className="p-4 md:hidden">
                          <StatusBadge status={doctor.acceptingStatus} />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 p-4 md:p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg text-foreground">
                                  {doctor.fullName}
                                </h3>
                                {/* Status Badge - Desktop */}
                                <div className="hidden md:block">
                                  <StatusBadge status={doctor.acceptingStatus} size="sm" />
                                </div>
                              </div>
                              <p className="text-muted-foreground mb-3">{doctor.clinicName}</p>
                              
                              <div className="flex flex-col gap-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="h-4 w-4 flex-shrink-0" />
                                  <span>{doctor.address}, {doctor.city}, {doctor.province} {doctor.postalCode}</span>
                                </div>
                                <a 
                                  href={`tel:${doctor.phone.replace(/[^0-9]/g, "")}`}
                                  className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Phone className="h-4 w-4 flex-shrink-0" />
                                  <span>{doctor.phone}</span>
                                </a>
                              </div>

                              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Updated {formatDate(doctor.statusLastUpdatedAt)}</span>
                                </div>
                                <span>
                                  Verified by {doctor.statusVerifiedBy === "doctor" ? "Doctor ✓" : "Community"}
                                </span>
                              </div>
                            </div>

                            <div className="hidden md:block">
                              <Button variant="outline" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                                <Link to={`/doctors/${doctor.id}`}>
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
                            <Link to={`/doctors/${doctor.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredDoctors.length === 0 && !loading && (
                  <div className="text-center py-16">
                    <p className="text-lg text-muted-foreground mb-4">
                      No doctors found matching your search.
                    </p>
                    <Button variant="outline" onClick={() => {
                      setSearchQuery("");
                      clearFilters();
                      setSearchParams({});
                    }}>
                      Clear Filters
                    </Button>
                  </div>
                )}

                {/* Bottom pagination */}
                {filteredDoctors.length > DOCTORS_PER_PAGE && (
                  <div className="flex justify-end pt-4">
                    <DoctorPagination
                      currentPage={currentPage}
                      totalItems={filteredDoctors.length}
                      itemsPerPage={DOCTORS_PER_PAGE}
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
                Get email alerts when doctors in your area start accepting patients.
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

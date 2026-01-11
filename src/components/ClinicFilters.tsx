import { Link } from "react-router-dom";
import { ClinicStatus } from "@/lib/clinics";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X, Lock } from "lucide-react";

interface ClinicFiltersProps {
  statusFilter: ClinicStatus | "all";
  onStatusFilterChange: (status: ClinicStatus | "all") => void;
  distanceFilter: string;
  onDistanceFilterChange: (distance: string) => void;
  languageFilter: string[];
  onLanguageFilterChange: (languages: string[]) => void;
  accessibilityFilter: boolean;
  onAccessibilityFilterChange: (accessible: boolean) => void;
  virtualFilter: boolean;
  onVirtualFilterChange: (virtual: boolean) => void;
  onClearFilters: () => void;
  isPaidUser?: boolean;
}

const languages = [
  "English",
  "French",
  "Mandarin",
  "Cantonese",
  "Punjabi",
  "Tamil",
  "Arabic",
  "Hindi",
  "Urdu",
  "Spanish",
  "Portuguese",
  "Korean",
  "Tagalog",
];

export function ClinicFilters({
  statusFilter,
  onStatusFilterChange,
  distanceFilter,
  onDistanceFilterChange,
  languageFilter,
  onLanguageFilterChange,
  accessibilityFilter,
  onAccessibilityFilterChange,
  virtualFilter,
  onVirtualFilterChange,
  onClearFilters,
  isPaidUser = false,
}: ClinicFiltersProps) {
  const toggleLanguage = (language: string) => {
    if (languageFilter.includes(language)) {
      onLanguageFilterChange(languageFilter.filter((l) => l !== language));
    } else {
      onLanguageFilterChange([...languageFilter, language]);
    }
  };

  const hasActiveFilters =
    statusFilter !== "all" ||
    distanceFilter !== "10" ||
    languageFilter.length > 0 ||
    accessibilityFilter ||
    virtualFilter;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg text-foreground flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Status</Label>
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusFilterChange(value as ClinicStatus | "all")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="accepting">Accepting</SelectItem>
            <SelectItem value="not_accepting">Not Accepting</SelectItem>
            <SelectItem value="waitlist">Waitlist</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Distance Filter */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Distance</Label>
        <Select value={distanceFilter} onValueChange={onDistanceFilterChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Distance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">Within 5 km</SelectItem>
            <SelectItem value="10">Within 10 km</SelectItem>
            <SelectItem value="25">Within 25 km</SelectItem>
            <SelectItem value="50">Within 50 km</SelectItem>
            <SelectItem value="any">Any Distance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Filters - Paid Users Only */}
      {isPaidUser ? (
        <>
          {/* Languages Filter */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Languages</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {languages.map((language) => (
                <div key={language} className="flex items-center gap-2">
                  <Checkbox
                    id={`lang-${language}`}
                    checked={languageFilter.includes(language)}
                    onCheckedChange={() => toggleLanguage(language)}
                  />
                  <label
                    htmlFor={`lang-${language}`}
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {language}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Accessibility Filter */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Accessibility</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="accessibility"
                checked={accessibilityFilter}
                onCheckedChange={(checked) => onAccessibilityFilterChange(checked === true)}
              />
              <label
                htmlFor="accessibility"
                className="text-sm text-foreground cursor-pointer"
              >
                Wheelchair Accessible
              </label>
            </div>
          </div>

          {/* Virtual Appointments Filter */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Services</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="virtual"
                checked={virtualFilter}
                onCheckedChange={(checked) => onVirtualFilterChange(checked === true)}
              />
              <label
                htmlFor="virtual"
                className="text-sm text-foreground cursor-pointer"
              >
                Virtual Appointments
              </label>
            </div>
          </div>
        </>
      ) : (
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">Advanced Filters</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Filter by language, accessibility, and virtual appointments with Alert Service.
          </p>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to="/pricing">Upgrade to Unlock</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

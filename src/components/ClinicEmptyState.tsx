import { Search } from "lucide-react";

export function ClinicEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-background-alt flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl text-foreground mb-2">Start Your Search</h3>
      <p className="text-muted-foreground max-w-md">
        Enter a city name or postal code to find family practice clinics accepting new patients in your area.
      </p>
    </div>
  );
}

import { Search } from "lucide-react";

export function DoctorEmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Search className="h-8 w-8 text-secondary" />
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-3">
        Find a Family Doctor
      </h3>
      
      <p className="text-muted-foreground max-w-md mx-auto mb-2">
        Use the search bar above to find family doctors accepting new patients in your area.
      </p>
      
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        Search by city, postal code, or doctor name to get started.
      </p>
    </div>
  );
}

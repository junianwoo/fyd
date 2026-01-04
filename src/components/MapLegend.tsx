interface MapLegendProps {
  className?: string;
}

// Using standard intuitive colors for status
const statusColors = {
  accepting: "#22c55e",      // Green - universally understood as positive/go
  not_accepting: "#dc2626",  // Red - universally understood as stop/no
  waitlist: "#F4A261",       // Orange - caution/waiting
  unknown: "#6b7280",        // Gray - unknown/neutral
};

export function MapLegend({ className = "" }: MapLegendProps) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm ${className}`}>
      <div className="flex items-center gap-1.5">
        <div 
          className="w-3 h-3 rounded-full border-2 border-white shadow-sm" 
          style={{ backgroundColor: statusColors.accepting }} 
        />
        <span className="text-foreground">Accepting</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div 
          className="w-3 h-3 rounded-full border-2 border-white shadow-sm" 
          style={{ backgroundColor: statusColors.waitlist }} 
        />
        <span className="text-foreground">Waitlist</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div 
          className="w-3 h-3 rounded-full border-2 border-white shadow-sm" 
          style={{ backgroundColor: statusColors.not_accepting }} 
        />
        <span className="text-foreground">Not Accepting</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div 
          className="w-3 h-3 rounded-full border-2 border-white shadow-sm" 
          style={{ backgroundColor: statusColors.unknown }} 
        />
        <span className="text-foreground">Unknown</span>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

export type DoctorStatus = "accepting" | "not_accepting" | "waitlist" | "unknown";

interface StatusBadgeProps {
  status: DoctorStatus;
  size?: "sm" | "default" | "lg";
  className?: string;
}

const statusConfig: Record<DoctorStatus, { label: string; className: string }> = {
  accepting: {
    label: "Accepting Patients",
    className: "bg-status-accepting text-white",
  },
  not_accepting: {
    label: "Not Accepting",
    className: "bg-status-not-accepting text-white",
  },
  waitlist: {
    label: "Waitlist Only",
    className: "bg-status-waitlist text-white",
  },
  unknown: {
    label: "Status Unknown",
    className: "bg-status-unknown text-white",
  },
};

export function StatusBadge({ status, size = "default", className }: StatusBadgeProps) {
  const config = statusConfig[status];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    default: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {config.label}
    </span>
  );
}

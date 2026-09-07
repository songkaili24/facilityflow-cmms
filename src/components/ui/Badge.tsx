import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  "critical" | "high" | "medium" | "low" | "danger" | "warning" | "success" | "info" | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  withDot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  critical: "bg-danger text-white ring-danger/60",
  high: "bg-accent text-white ring-accent/60",
  medium: "bg-warning text-warning-foreground ring-warning/60",
  low: "bg-charcoal-100 text-charcoal-700 ring-charcoal-300",
  danger: "bg-danger/15 text-danger ring-danger/40",
  warning: "bg-warning/20 text-warning-foreground ring-warning/50",
  success: "bg-success/15 text-charcoal-800 ring-success/50",
  info: "bg-info/15 text-charcoal-800 ring-info/50",
  neutral: "bg-muted text-muted-foreground ring-charcoal-300",
};

const dotClasses: Record<BadgeVariant, string> = {
  critical: "bg-danger",
  high: "bg-accent",
  medium: "bg-warning",
  low: "bg-charcoal-400",
  danger: "bg-danger",
  warning: "bg-warning",
  success: "bg-success",
  info: "bg-info",
  neutral: "bg-charcoal-400",
};

export function Badge({
  className,
  variant = "neutral",
  withDot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ring-1 ring-inset",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {withDot && <span aria-hidden className={cn("h-2 w-2 rounded-full", dotClasses[variant])} />}
      {children}
    </span>
  );
}

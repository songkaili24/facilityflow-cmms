import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 active:bg-accent/80",
  secondary:
    "bg-charcoal-800 text-charcoal-50 shadow-sm hover:bg-charcoal-700 active:bg-charcoal-900",
  outline: "border border-input bg-card text-foreground hover:bg-muted active:bg-charcoal-100",
  ghost: "text-foreground hover:bg-muted active:bg-charcoal-100",
  danger: "bg-danger text-danger-foreground shadow-sm hover:bg-danger/90 active:bg-danger/80",
  success: "bg-success text-success-foreground shadow-sm hover:bg-success/90 active:bg-success/80",
};

/** md already clears the 48px minimum; lg is the gloved-hands field size. */
const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 gap-1.5 px-3 text-sm",
  md: "min-h-12 gap-2 px-5 text-base",
  lg: "min-h-14 gap-2.5 px-7 text-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "focus-ring inline-flex select-none items-center justify-center whitespace-nowrap rounded-lg font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

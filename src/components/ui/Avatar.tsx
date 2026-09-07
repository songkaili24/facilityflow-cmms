import { cn, initials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  /** Hue 0–360; each technician gets a stable accent. */
  hue?: number;
  className?: string;
}

/** Initials avatar used on cards, the technician panel, and the timeline. */
export function Avatar({ name, hue, className }: AvatarProps) {
  return (
    <span
      aria-hidden
      title={name}
      style={hue !== undefined ? { backgroundColor: `hsl(${hue} 45% 30%)` } : undefined}
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white",
        hue === undefined && "bg-charcoal-600",
        className
      )}
    >
      {initials(name)}
    </span>
  );
}

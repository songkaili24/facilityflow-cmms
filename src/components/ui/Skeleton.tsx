"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  /** Circle avatar or bar shape. */
  rounded?: "full" | "md" | "xl";
}

/**
 * Shimmering placeholder shown while demo data resolves. The global
 * prefers-reduced-motion rule freezes the shimmer — the block still reads
 * as a loading placeholder.
 */
export function Skeleton({ className, rounded = "md" }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden bg-charcoal-200/70",
        rounded === "full" && "rounded-full",
        rounded === "md" && "rounded-lg",
        rounded === "xl" && "rounded-xl",
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

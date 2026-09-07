"use client";

import { AlarmClock } from "lucide-react";
import { useNow } from "@/lib/hooks";
import { cn, formatDuration } from "@/lib/utils";

/** Live SLA countdown — flips to "breached" styling past the deadline. */
export function SlaCountdown({ dueAt, closed }: { dueAt: string; closed: boolean }) {
  const now = useNow(15_000);
  const remaining = new Date(dueAt).getTime() - now;
  const breached = remaining < 0 && !closed;

  return (
    <div
      role="timer"
      aria-label={breached ? "SLA breached" : "SLA time remaining"}
      className={cn(
        "rounded-xl border-2 p-4",
        closed
          ? "border-success/40 bg-success/10"
          : breached
            ? "border-danger bg-danger/10"
            : "border-warning/50 bg-warning/10"
      )}
      suppressHydrationWarning
    >
      <div className="flex items-center gap-2">
        <AlarmClock
          aria-hidden
          className={cn(
            "h-5 w-5",
            closed ? "text-success" : breached ? "text-danger" : "text-warning"
          )}
        />
        <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-600">
          {closed ? "Closed within SLA window" : breached ? "SLA breached" : "SLA countdown"}
        </h2>
      </div>
      <p
        className={cn(
          "mt-2 font-heading text-3xl font-extrabold tabular-nums",
          closed ? "text-charcoal-700" : breached ? "text-danger" : "text-charcoal-800"
        )}
      >
        {closed ? "✓ Verified" : formatDuration(Math.abs(remaining))}
      </p>
      <p className="mt-1 text-xs font-semibold text-charcoal-500">
        {closed
          ? "Completion record filed"
          : breached
            ? "past deadline — escalate or expedite"
            : "remaining until deadline"}
      </p>
    </div>
  );
}

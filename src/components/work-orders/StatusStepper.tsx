"use client";

import { Check } from "lucide-react";
import { STATUS_ORDER } from "@/lib/statuses";
import { cn } from "@/lib/utils";
import type { WorkOrderStatus } from "@/lib/types";

const STEP_LABELS: Record<WorkOrderStatus, string> = {
  reported: "Reported",
  assigned: "Assigned",
  in_progress: "In Progress",
  awaiting_parts: "Awaiting Parts",
  completed: "Completed",
  verified: "Verified",
};

interface StatusStepperProps {
  status: WorkOrderStatus;
  className?: string;
}

/**
 * Reported → Assigned → In Progress → Completed → Verified.
 * `awaiting_parts` renders as "off the main path" (current step, marked hold).
 */
export function StatusStepper({ status, className }: StatusStepperProps) {
  const currentIndex = STATUS_ORDER.indexOf(status);
  const isOnPath = status !== "awaiting_parts";

  return (
    <ol aria-label="Work order progress" className={cn("flex items-start", className)}>
      {STATUS_ORDER.map((step, i) => {
        const done = isOnPath && i < currentIndex;
        const current = isOnPath ? i === currentIndex : i === STATUS_ORDER.indexOf("in_progress");
        return (
          <li key={step} className="flex min-w-0 flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <span
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    done || current ? "bg-success" : "bg-charcoal-200"
                  )}
                />
              )}
              <span
                aria-hidden
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-sm font-bold",
                  done
                    ? "border-success bg-success text-white"
                    : current
                      ? status === "awaiting_parts"
                        ? "border-charcoal-400 bg-charcoal-400 text-white"
                        : "border-warning bg-warning text-white"
                      : "border-charcoal-200 bg-card text-charcoal-300"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              {i < STATUS_ORDER.length - 1 && (
                <span
                  className={cn("h-1 flex-1 rounded-full", done ? "bg-success" : "bg-charcoal-200")}
                />
              )}
            </div>
            <span
              className={cn(
                "mt-1.5 text-center text-[11px] font-bold uppercase tracking-wide",
                done || current ? "text-charcoal-700" : "text-charcoal-400"
              )}
            >
              {STEP_LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

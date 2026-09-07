"use client";

import { Check, Circle } from "lucide-react";
import { useOpsStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { WorkOrder } from "@/lib/types";

interface StepperProps {
  workOrder: WorkOrder;
}

/** Interactive checklist for the work order detail view. */
export function ChecklistStepper({ workOrder }: StepperProps) {
  const toggleChecklistItem = useOpsStore((s) => s.toggleChecklistItem);

  return (
    <ol className="space-y-2">
      {workOrder.checklist.map((item, index) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => toggleChecklistItem(workOrder.id, item.id)}
            aria-pressed={item.done}
            className={cn(
              "focus-ring flex min-h-12 w-full items-center gap-3 rounded-lg border px-3 py-2 text-left",
              item.done
                ? "border-success/40 bg-success/10"
                : "border-border bg-card hover:border-charcoal-300"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-sm font-bold",
                item.done
                  ? "border-success bg-success text-white"
                  : "border-charcoal-300 text-charcoal-400"
              )}
            >
              {item.done ? <Check className="h-4 w-4" /> : index + 1}
            </span>
            <span
              className={cn(
                "text-sm font-medium leading-snug",
                item.done ? "text-charcoal-500 line-through" : "text-charcoal-800"
              )}
            >
              {item.label}
            </span>
            <Circle
              aria-hidden
              className={cn("ml-auto h-3 w-3", item.done ? "text-success" : "text-charcoal-200")}
            />
          </button>
        </li>
      ))}
    </ol>
  );
}

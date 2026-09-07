"use client";

import { PackageCheck, PackageOpen, PackageX } from "lucide-react";
import { useOpsStore } from "@/lib/store";
import { cn, formatMoney } from "@/lib/utils";
import type { PartLine } from "@/lib/types";

const STATUS_STYLE: Record<
  PartLine["status"],
  { label: string; icon: typeof PackageCheck; className: string }
> = {
  on_hand: { label: "On hand", icon: PackageCheck, className: "text-success" },
  ordered: { label: "Ordered", icon: PackageOpen, className: "text-info" },
  backordered: { label: "Backordered", icon: PackageX, className: "text-danger" },
};

/** Parts & materials checklist with toggleable on-hand/ordered status. */
export function PartsChecklist({ workOrderId, parts }: { workOrderId: string; parts: PartLine[] }) {
  const togglePart = useOpsStore((s) => s.togglePart);
  const total = parts.reduce((sum, p) => sum + p.qty * p.unitCost, 0);

  if (parts.length === 0) {
    return (
      <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
        No parts logged for this work order.
      </p>
    );
  }

  return (
    <div>
      <ul className="space-y-2">
        {parts.map((part) => {
          const style = STATUS_STYLE[part.status];
          const Icon = style.icon;
          return (
            <li key={part.id}>
              <button
                type="button"
                onClick={() => togglePart(workOrderId, part.id)}
                aria-label={`${part.name}: ${style.label}. Toggle availability.`}
                className="focus-ring flex min-h-12 w-full items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-left hover:border-charcoal-300"
              >
                <Icon aria-hidden className={cn("h-5 w-5 shrink-0", style.className)} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-charcoal-800">
                    {part.name}
                  </span>
                  <span className="block text-xs text-charcoal-500">
                    Qty {part.qty} × {formatMoney(part.unitCost)}
                  </span>
                </span>
                <span
                  className={cn(
                    "shrink-0 text-xs font-bold uppercase tracking-wide",
                    style.className
                  )}
                >
                  {style.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm">
        <span className="font-bold uppercase tracking-wide text-charcoal-600">
          Estimated parts cost
        </span>
        <span className="font-heading text-lg font-extrabold text-charcoal-800">
          {formatMoney(total)}
        </span>
      </p>
    </div>
  );
}

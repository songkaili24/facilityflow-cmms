"use client";

import Link from "next/link";
import { ChevronRight, Siren } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusIndicator";
import { PRIORITY_META } from "@/lib/statuses";
import { useTechnicianLookup } from "@/lib/hooks";
import { cn, formatLocation, formatRelative } from "@/lib/utils";
import type { WorkOrder } from "@/lib/types";

/** Mobile list card — full detail route on tap. */
export function WorkOrderCard({ workOrder: wo }: { workOrder: WorkOrder }) {
  const { technicianById } = useTechnicianLookup();
  const tech = technicianById(wo.assigneeId);
  const assignee = tech?.name ?? "Unassigned";
  const breached = new Date(wo.dueAt).getTime() < Date.now() && wo.status !== "completed";

  return (
    <article className={cn("relative", breached && "rounded-xl")}>
      <Link
        href={`/workorders/${wo.id}`}
        aria-label={`Open ${wo.number}: ${wo.title}`}
        className={cn(
          "focus-ring block rounded-xl border border-border bg-card p-4 text-left shadow-card transition-colors hover:border-charcoal-300",
          breached && "border-l-4 border-l-danger"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold text-charcoal-500">{wo.number}</span>
          <StatusBadge status={wo.status} />
          <Badge variant={PRIORITY_META[wo.priority].badgeVariant} className="ml-auto">
            {PRIORITY_META[wo.priority].label}
          </Badge>
          {wo.isEmergency && (
            <Badge variant="critical">
              <Siren aria-hidden className="mr-1 inline h-3 w-3" />
              Emergency
            </Badge>
          )}
        </div>

        <h3 className="mt-2 text-lg font-bold leading-snug">{wo.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{formatLocation(wo.location)}</p>

        <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
          <Avatar name={assignee} hue={tech?.hue} className="h-8 w-8 text-[11px]" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-charcoal-700">
            {assignee}
          </span>
          <span
            suppressHydrationWarning
            className={cn(
              "text-xs font-semibold tabular-nums",
              breached ? "text-danger" : "text-charcoal-500"
            )}
          >
            Due {formatRelative(wo.dueAt)}
          </span>
          <ChevronRight aria-hidden className="h-4 w-4 text-charcoal-300" />
        </div>
        <p suppressHydrationWarning className="mt-1 text-xs text-charcoal-400">
          Reported {formatRelative(wo.reportedAt)}
        </p>
      </Link>
    </article>
  );
}

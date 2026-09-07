"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { StatusDot } from "@/components/ui/StatusIndicator";
import { PRIORITY_META, STATUS_META } from "@/lib/statuses";
import { useTechnicianLookup } from "@/lib/hooks";
import { cn, formatLocation, formatRelative } from "@/lib/utils";
import type { WorkOrder } from "@/lib/types";

/** Table view — dense, desktop-first work order listing. */
export function WorkOrderListTable({ workOrders }: { workOrders: WorkOrder[] }) {
  const { technicianById } = useTechnicianLookup();

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
      <table className="w-full min-w-[54rem] text-left text-sm">
        <caption className="sr-only">Work orders matching the current filters</caption>
        <thead>
          <tr className="border-b border-border bg-muted/60 text-xs font-bold uppercase tracking-widest text-charcoal-500">
            <th scope="col" className="px-4 py-3">
              WO #
            </th>
            <th scope="col" className="px-4 py-3">
              Title
            </th>
            <th scope="col" className="px-4 py-3">
              Priority
            </th>
            <th scope="col" className="px-4 py-3">
              Status
            </th>
            <th scope="col" className="px-4 py-3">
              Location
            </th>
            <th scope="col" className="px-4 py-3">
              Assignee
            </th>
            <th scope="col" className="px-4 py-3">
              Due
            </th>
          </tr>
        </thead>
        <tbody>
          {workOrders.map((wo) => {
            const tech = technicianById(wo.assigneeId);
            const breached =
              new Date(wo.dueAt).getTime() < Date.now() &&
              wo.status !== "completed" &&
              wo.status !== "verified";
            return (
              <tr key={wo.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                <th scope="row" className="px-4 py-3">
                  <Link
                    href={`/workorders/${wo.id}`}
                    className="focus-ring rounded font-mono font-bold text-accent underline-offset-2 hover:underline"
                  >
                    {wo.number}
                  </Link>
                </th>
                <td className="max-w-64 px-4 py-3">
                  <Link
                    href={`/workorders/${wo.id}`}
                    className="focus-ring block truncate rounded font-semibold text-charcoal-800 underline-offset-2 hover:underline"
                  >
                    {wo.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={PRIORITY_META[wo.priority].badgeVariant}
                    className="!px-2 !py-0.5"
                  >
                    {PRIORITY_META[wo.priority].label}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-700">
                    <StatusDot status={wo.status} />
                    {STATUS_META[wo.status].label}
                  </span>
                </td>
                <td className="max-w-44 truncate px-4 py-3 text-charcoal-600">
                  {formatLocation(wo.location)}
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <Avatar
                      name={tech?.name ?? "Unassigned"}
                      hue={tech?.hue}
                      className="h-7 w-7 text-[10px]"
                    />
                    <span className="truncate text-charcoal-700">{tech?.name ?? "Unassigned"}</span>
                  </span>
                </td>
                <td
                  className={cn(
                    "px-4 py-3 tabular-nums",
                    breached ? "font-semibold text-danger" : "text-charcoal-600"
                  )}
                  suppressHydrationWarning
                >
                  {formatRelative(wo.dueAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

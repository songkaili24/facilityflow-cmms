"use client";

import { useState } from "react";
import { Siren } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { StatusDot } from "@/components/ui/StatusIndicator";
import { PRIORITY_META, STATUS_ORDER, STATUS_META } from "@/lib/statuses";
import { useOpsStore } from "@/lib/store";
import { isSlaBreached } from "@/lib/utils";
import type { WorkOrder, WorkOrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLUMN_ACCENT: Record<WorkOrderStatus, string> = {
  new: "border-t-danger",
  assigned: "border-t-info",
  in_progress: "border-t-warning",
  on_hold: "border-t-charcoal-400",
  completed: "border-t-success",
};

interface KanbanBoardProps {
  workOrders: WorkOrder[];
  onSelect: (wo: WorkOrder) => void;
  selectedId?: string | null;
}

/** Desktop kanban with HTML5 drag-and-drop between status columns. */
export function KanbanBoard({ workOrders, onSelect, selectedId }: KanbanBoardProps) {
  const [dragOver, setDragOver] = useState<WorkOrderStatus | null>(null);
  const moveToStatus = useOpsStore((s) => s.moveToStatus);

  return (
    <div className="grid grid-cols-5 items-start gap-4">
      {STATUS_ORDER.map((status) => {
        const columnItems = workOrders
          .filter((wo) => wo.status === status)
          .sort((a, b) => PRIORITY_META[a.priority].rank - PRIORITY_META[b.priority].rank);

        return (
          <section
            key={status}
            aria-label={STATUS_META[status].label}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(status);
            }}
            onDragLeave={() => setDragOver((cur) => (cur === status ? null : cur))}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/plain");
              if (id) moveToStatus(id, status);
              setDragOver(null);
            }}
            className={cn(
              "flex min-h-[28rem] flex-col rounded-xl border border-t-4 border-border bg-muted/40",
              COLUMN_ACCENT[status],
              dragOver === status && "ring-2 ring-accent ring-offset-2"
            )}
          >
            <header className="flex items-center gap-2 px-4 pb-2 pt-4">
              <StatusDot status={status} />
              <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-charcoal-700">
                {STATUS_META[status].label}
              </h2>
              <span className="ml-auto rounded-full bg-charcoal-100 px-2 py-0.5 text-xs font-bold text-charcoal-600">
                {columnItems.length}
              </span>
            </header>
            <div className="flex flex-1 flex-col gap-3 p-3">
              {columnItems.map((wo) => (
                <KanbanCard
                  key={wo.id}
                  workOrder={wo}
                  onSelect={onSelect}
                  selected={wo.id === selectedId}
                />
              ))}
              {columnItems.length === 0 && (
                <p className="rounded-lg border-2 border-dashed border-charcoal-200 p-4 text-center text-xs font-semibold uppercase tracking-wide text-charcoal-300">
                  Drop card here
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function KanbanCard({
  workOrder,
  onSelect,
  selected,
}: {
  workOrder: WorkOrder;
  onSelect: (wo: WorkOrder) => void;
  selected: boolean;
}) {
  const advanceStatus = useOpsStore((s) => s.advanceStatus);
  const breached =
    workOrder.slaDueAt && isSlaBreached(workOrder.slaDueAt) && workOrder.status !== "completed";

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", workOrder.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className={cn(
        "group cursor-grab rounded-lg border border-border bg-card p-3 shadow-card active:cursor-grabbing",
        selected && "ring-2 ring-accent",
        breached && "border-l-4 border-l-danger"
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(workOrder)}
        className="focus-ring -m-1 w-full rounded p-1 text-left"
        aria-label={`Open ${workOrder.number}: ${workOrder.title}`}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-charcoal-500">{workOrder.number}</span>
          <Badge
            variant={PRIORITY_META[workOrder.priority].badgeVariant}
            className="ml-auto !px-2 !py-0.5"
          >
            {PRIORITY_META[workOrder.priority].label}
          </Badge>
        </div>
        <h3 className="mt-1.5 text-sm font-bold leading-snug">{workOrder.title}</h3>
        <p className="mt-1 truncate text-xs text-muted-foreground">{workOrder.location}</p>
      </button>

      <div className="mt-2 flex items-center justify-between gap-2">
        {breached ? (
          <Badge variant="danger" withDot className="!px-2 !py-0.5">
            SLA breached
          </Badge>
        ) : (
          <span className="text-xs text-charcoal-400">Advance →</span>
        )}
        <button
          type="button"
          onClick={() => advanceStatus(workOrder.id)}
          className="focus-ring min-h-12 rounded px-2 text-xs font-bold uppercase tracking-wide text-charcoal-500 hover:text-accent"
        >
          Move →
        </button>
      </div>
    </article>
  );
}

/** Small flag used on cards to mark emergency dispatches. */
export function EmergencyFlag() {
  return (
    <Badge variant="critical" className="!px-2 !py-0.5">
      <Siren aria-hidden className="mr-1 inline h-3 w-3" />
      Emergency
    </Badge>
  );
}

"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { StatusDot } from "@/components/ui/StatusIndicator";
import { KANBAN_COLUMNS, PRIORITY_META } from "@/lib/statuses";
import { useOpsStore } from "@/lib/store";
import { useTechnicianLookup } from "@/lib/hooks";
import { cn, formatLocation, formatRelative } from "@/lib/utils";
import type { WorkOrder, WorkOrderStatus } from "@/lib/types";

const COLUMN_ACCENT: Record<WorkOrderStatus, string> = {
  reported: "border-t-danger",
  assigned: "border-t-info",
  in_progress: "border-t-warning",
  awaiting_parts: "border-t-charcoal-400",
  completed: "border-t-success",
  verified: "border-t-success",
};

interface KanbanBoardProps {
  workOrders: WorkOrder[];
}

/** Dispatch board — five status columns with drag-and-drop between them. */
export function KanbanBoard({ workOrders }: KanbanBoardProps) {
  const [dragOver, setDragOver] = useState<WorkOrderStatus | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const setStatus = useOpsStore((s) => s.setStatus);

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {KANBAN_COLUMNS.map(({ status, label }) => {
        const isDropTarget = dragOver === status && draggingId !== null;
        const columnItems = workOrders
          .filter(
            (wo) => wo.status === status || (status === "completed" && wo.status === "verified")
          )
          .sort((a, b) => PRIORITY_META[a.priority].rank - PRIORITY_META[b.priority].rank);

        return (
          <section
            key={status}
            aria-label={`${label} column`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(status);
            }}
            onDragLeave={() => setDragOver((cur) => (cur === status ? null : cur))}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/plain");
              if (id) setStatus(id, status);
              setDragOver(null);
              setDraggingId(null);
            }}
            className={cn(
              "flex w-72 shrink-0 flex-col rounded-xl border border-t-4 border-border bg-muted/40 transition-all duration-150 lg:w-auto lg:shrink",
              COLUMN_ACCENT[status],
              isDropTarget && "scale-[1.01] bg-accent/10 ring-2 ring-accent ring-offset-2"
            )}
          >
            <header
              className={cn(
                "flex items-center gap-2 px-3 pb-2 pt-3 transition-colors",
                isDropTarget && "text-accent"
              )}
            >
              <StatusDot status={status} />
              <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-charcoal-700">
                {label}
              </h2>
              <span className="ml-auto rounded-full bg-charcoal-100 px-2 py-0.5 text-xs font-bold text-charcoal-600">
                {columnItems.length}
              </span>
            </header>
            <div className="flex flex-1 flex-col gap-3 p-2">
              {columnItems.map((wo) => (
                <KanbanCard
                  key={wo.id}
                  workOrder={wo}
                  dragging={draggingId === wo.id}
                  onDragStart={() => setDraggingId(wo.id)}
                  onDragEnd={() => setDraggingId(null)}
                />
              ))}
              <p
                aria-hidden
                className={cn(
                  "flex min-h-20 items-center justify-center rounded-lg border-2 border-dashed text-center text-xs font-semibold uppercase tracking-wide transition-colors",
                  isDropTarget
                    ? "border-accent bg-accent/5 text-accent"
                    : "border-charcoal-200 text-charcoal-300"
                )}
              >
                {isDropTarget ? `Drop into ${label}` : "Drop card here"}
              </p>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function KanbanCard({
  workOrder: wo,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  workOrder: WorkOrder;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const { technicianById } = useTechnicianLookup();
  const tech = technicianById(wo.assigneeId);
  const assignee = tech?.name ?? "Unassigned";
  const overdue = new Date(wo.dueAt).getTime() < Date.now() && wo.status !== "completed";

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", wo.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab rounded-lg border border-border bg-card p-3 shadow-card active:cursor-grabbing",
        overdue && "border-l-4 border-l-danger",
        dragging && "opacity-40 ring-2 ring-accent/60"
      )}
    >
      <a
        href={`/workorders/${wo.id}`}
        className="focus-ring -m-1 block rounded p-1"
        aria-label={`Open ${wo.number}: ${wo.title}`}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-charcoal-500">{wo.number}</span>
          <Badge
            variant={PRIORITY_META[wo.priority].badgeVariant}
            className="ml-auto !px-2 !py-0.5"
          >
            {PRIORITY_META[wo.priority].label}
          </Badge>
        </div>
        <h3 className="mt-1.5 text-sm font-bold leading-snug">{wo.title}</h3>
        <p className="mt-1 truncate text-xs text-muted-foreground">{formatLocation(wo.location)}</p>
      </a>
      <div className="mt-2 flex items-center gap-2 border-t border-border pt-2">
        <Avatar name={assignee} hue={tech?.hue} className="h-7 w-7 text-[10px]" />
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{assignee}</span>
        <time
          dateTime={wo.dueAt}
          suppressHydrationWarning
          className={cn(
            "text-xs font-semibold tabular-nums",
            overdue ? "text-danger" : "text-charcoal-500"
          )}
        >
          {formatRelative(wo.dueAt)}
        </time>
      </div>
    </article>
  );
}

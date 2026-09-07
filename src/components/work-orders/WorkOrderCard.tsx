"use client";

import { useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusIndicator";
import { PRIORITY_META } from "@/lib/statuses";
import { useOpsStore } from "@/lib/store";
import { cn, formatRelative, isSlaBreached } from "@/lib/utils";
import type { WorkOrder } from "@/lib/types";

const SWIPE_THRESHOLD = 72;

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  onOpen: (wo: WorkOrder) => void;
}

/**
 * Mobile work order card with swipe actions:
 *  - swipe right  → advance status (New → Assigned → In Progress → Completed)
 *  - swipe left   → reveal quick actions (open details / escalate)
 * Desktop pointer input is ignored, so dragging doesn't fight click/scroll.
 */
export function WorkOrderCard({ workOrder, onOpen }: WorkOrderCardProps) {
  const advanceStatus = useOpsStore((s) => s.advanceStatus);

  return (
    <SwipeCard
      workOrder={workOrder}
      onOpen={onOpen}
      onSwipeRight={() => {
        advanceStatus(workOrder.id);
      }}
    />
  );
}

function SwipeCard({
  workOrder,
  onOpen,
  onSwipeRight,
}: {
  workOrder: WorkOrder;
  onOpen: (wo: WorkOrder) => void;
  onSwipeRight: () => void;
}) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const lockedAxis = useRef<"x" | "y" | null>(null);

  const breached =
    workOrder.slaDueAt && isSlaBreached(workOrder.slaDueAt) && workOrder.status !== "completed";

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0]?.clientX ?? 0;
    startY.current = e.touches[0]?.clientY ?? 0;
    lockedAxis.current = null;
    setDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    const dX = t.clientX - startX.current;
    const dY = t.clientY - startY.current;
    if (!lockedAxis.current) {
      if (Math.abs(dX) > 10 || Math.abs(dY) > 10) {
        lockedAxis.current = Math.abs(dX) > Math.abs(dY) ? "x" : "y";
      } else return;
    }
    if (lockedAxis.current === "x") setDx(Math.max(-140, Math.min(140, dX)));
  };

  const handleTouchEnd = () => {
    setDragging(false);
    if (dx > SWIPE_THRESHOLD) onSwipeRight();
    setDx(0);
  };

  return (
    <article className="relative overflow-hidden rounded-xl">
      {/* Action layer revealed by swipes */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 flex w-36 items-center justify-center bg-success/90 text-white"
      >
        <span className="text-center text-sm font-bold uppercase tracking-wide">
          Advance
          <br />
          status
        </span>
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging ? "none" : "transform 200ms ease-out",
        }}
      >
        <button
          type="button"
          onClick={() => onOpen(workOrder)}
          className="focus-ring w-full rounded-xl border border-border bg-card p-4 text-left shadow-card transition-colors hover:border-charcoal-300"
          aria-label={`Open ${workOrder.number}: ${workOrder.title}`}
        >
          <div className="flex items-center gap-2">
            <StatusBadge status={workOrder.status} />
            <Badge variant={PRIORITY_META[workOrder.priority].badgeVariant}>
              {PRIORITY_META[workOrder.priority].label}
            </Badge>
            {breached && (
              <Badge variant="danger" className="ml-auto">
                SLA breached
              </Badge>
            )}
          </div>

          <h3 className="mt-3 text-lg font-bold leading-snug">{workOrder.title}</h3>

          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <div className="truncate">
              <dt className="sr-only">Location</dt>
              <dd className="truncate">{workOrder.location}</dd>
            </div>
            <div className="text-right">
              <dt className="sr-only">Category</dt>
              <dd>{workOrder.category}</dd>
            </div>
            {workOrder.assetTag && (
              <div>
                <dt className="sr-only">Asset</dt>
                <dd className="font-mono text-xs font-semibold text-charcoal-700">
                  {workOrder.assetTag}
                </dd>
              </div>
            )}
            <div className={cn("text-right", workOrder.assetTag ? "" : "col-span-1")}>
              <dt className="sr-only">Opened</dt>
              <dd>{formatRelative(workOrder.createdAt)}</dd>
            </div>
          </dl>

          <ChecklistProgress workOrder={workOrder} />
        </button>
      </div>
    </article>
  );
}

export function ChecklistProgress({ workOrder }: { workOrder: WorkOrder }) {
  const done = workOrder.checklist.filter((i) => i.done).length;
  const total = workOrder.checklist.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="mt-3 flex items-center gap-2">
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${workOrder.number} checklist progress`}
        className="h-2 flex-1 overflow-hidden rounded-full bg-charcoal-100"
      >
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct === 100 ? "bg-success" : "bg-accent"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-14 text-right text-xs font-semibold tabular-nums text-charcoal-600">
        {done}/{total} steps
      </span>
      <ChevronRight aria-hidden className="h-4 w-4 text-charcoal-300" />
    </div>
  );
}

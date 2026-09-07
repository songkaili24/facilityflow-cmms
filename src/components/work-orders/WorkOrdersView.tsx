"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { FilterChips } from "./FilterChips";
import { KanbanBoard } from "./KanbanBoard";
import { WorkOrderCard } from "./WorkOrderCard";
import { WorkOrderDetail } from "./WorkOrderDetail";
import { PRIORITY_META } from "@/lib/statuses";
import { useOpsStore } from "@/lib/store";
import { useWorkOrders } from "@/lib/hooks";
import type { WorkOrder } from "@/lib/types";

export function WorkOrdersView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const { workOrders } = useWorkOrders();
  const filter = useOpsStore((s) => s.filter);

  const [selected, setSelected] = useState<WorkOrder | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  // Deep link: /work-orders?wo=WO-2041 opens the split view preloaded.
  useEffect(() => {
    const number = searchParams.get("wo");
    if (!number) return;
    const match = workOrders.find((wo) => wo.number === number);
    if (match) setSelected(match);
  }, [searchParams, workOrders]);

  const filtered = workOrders
    .filter((wo) => (filter === "active" ? wo.status !== "completed" : true))
    .filter((wo) => (filter === "all" || filter === "active" ? true : wo.category === filter))
    .sort(
      (a, b) =>
        PRIORITY_META[a.priority].rank - PRIORITY_META[b.priority].rank ||
        a.number.localeCompare(b.number)
    );

  const openDetail = (wo: WorkOrder) => {
    setSelected(wo);
    setMobileDetailOpen(true);
    router.replace(`/work-orders?wo=${wo.number}`, { scroll: false });
  };

  const closeDetail = () => {
    setSelected(null);
    setMobileDetailOpen(false);
    router.replace("/work-orders", { scroll: false });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Active Work Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Swipe a card right to advance status · tap to open the split view
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          onClick={() =>
            toast({
              title: "New work order intake",
              description: "Request form opens with the dispatcher module.",
              variant: "info",
            })
          }
        >
          New Work Order
        </Button>
      </div>

      <FilterChips />

      {/* Mobile: swipeable card list (hidden ≥ md) */}
      <div className="grid gap-3 md:hidden" aria-label="Work order list">
        {filtered.map((wo) => (
          <WorkOrderCard key={wo.id} workOrder={wo} onOpen={openDetail} />
        ))}
        {filtered.length === 0 && (
          <p className="rounded-xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
            No work orders match this filter.
          </p>
        )}
      </div>

      {/* Desktop: kanban board + split-view detail (hidden < md) */}
      <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_420px]">
        <KanbanBoard workOrders={filtered} onSelect={setSelected} selectedId={selected?.id} />
        <aside className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-card">
          {selected ? (
            <WorkOrderDetail workOrder={selected} />
          ) : (
            <div className="grid min-h-64 place-items-center text-center">
              <div>
                <p className="font-heading text-lg font-bold text-charcoal-700">
                  Select a work order
                </p>
                <p className="mt-1 max-w-56 text-sm text-muted-foreground">
                  Click a card on the board to review scope, checklist, and field notes here.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Tablet (< lg): stacked detail sheet below the board is omitted — md–lg
          users get the mobile card flow. Detail opens as a full-screen sheet. */}
      {mobileDetailOpen && selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.number} detail`}
          className="fixed inset-0 z-50 animate-fade-in overflow-y-auto bg-background"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3">
            <span className="font-mono text-sm font-bold text-charcoal-500">{selected.number}</span>
            <Button variant="ghost" size="md" onClick={closeDetail} aria-label="Close detail view">
              <X aria-hidden className="h-5 w-5" />
              Close
            </Button>
          </div>
          <div className="mx-auto max-w-2xl p-4 pb-28">
            <WorkOrderDetail workOrder={selected} />
          </div>
        </div>
      )}
    </div>
  );
}

/** Suspense fallback shown while the deep-link param resolves. */
export function WorkOrdersFallback() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading work orders">
      <div className="h-9 w-72 animate-pulse rounded-lg bg-muted" />
      <div className="flex gap-2">
        {[64, 80, 72, 96, 88, 76].map((w, i) => (
          <div key={i} className="h-12 animate-pulse rounded-full bg-muted" style={{ width: w }} />
        ))}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-36 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}

export function WorkOrdersPageClient() {
  return (
    <Suspense fallback={<WorkOrdersFallback />}>
      <WorkOrdersView />
    </Suspense>
  );
}

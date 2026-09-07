"use client";

import { useState } from "react";
import { Kanban as KanbanIcon, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { useOpsStore, filterWorkOrders } from "@/lib/store";
import { useTechnicianLookup } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { FilterBar } from "./FilterBar";
import { KanbanBoard } from "./KanbanBoard";
import { NewWorkOrderModal } from "./NewWorkOrderModal";
import { WorkOrderCard } from "./WorkOrderCard";
import { WorkOrderListTable } from "./WorkOrderListTable";

type BoardView = "kanban" | "list";

/** /workorders — dispatch board: kanban + list views, search, filters, intake. */
export function WorkOrdersView() {
  const workOrders = useOpsStore((s) => s.workOrders);
  const filters = useOpsStore((s) => s.filters);
  const setQuery = useOpsStore((s) => s.setQuery);
  const { technicianName } = useTechnicianLookup();

  const [view, setView] = useState<BoardView>("kanban");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = filterWorkOrders(workOrders, filters, technicianName);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Active Work Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground" suppressHydrationWarning>
            {filtered.length} of {workOrders.length} shown · drag cards to update status
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
          <Plus aria-hidden className="mr-2 h-5 w-5" />
          New Work Order
        </Button>
      </div>

      <SearchInput
        value={filters.query}
        onChange={setQuery}
        label="Search work orders by ID, title, or location"
        placeholder="Search WO #, title, building, floor, zone, room…"
      />

      <FilterBar />

      <div
        role="group"
        aria-label="View mode"
        className="inline-flex rounded-lg border border-input bg-card p-1"
      >
        <button
          type="button"
          onClick={() => setView("kanban")}
          aria-pressed={view === "kanban"}
          className={cn(
            "focus-ring inline-flex min-h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold",
            view === "kanban" ? "bg-charcoal-800 text-white" : "text-charcoal-600 hover:bg-muted"
          )}
        >
          <KanbanIcon aria-hidden className="h-4 w-4" />
          Board
        </button>
        <button
          type="button"
          onClick={() => setView("list")}
          aria-pressed={view === "list"}
          className={cn(
            "focus-ring inline-flex min-h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold",
            view === "list" ? "bg-charcoal-800 text-white" : "text-charcoal-600 hover:bg-muted"
          )}
        >
          <List aria-hidden className="h-4 w-4" />
          List
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-charcoal-200 bg-card p-10 text-center text-sm text-muted-foreground shadow-card">
          No work orders match the current search and filters.
        </p>
      ) : view === "kanban" ? (
        <>
          <div className="hidden lg:block">
            <KanbanBoard workOrders={filtered} />
          </div>
          {/* Mobile: stacked cards in priority order */}
          <div className="grid gap-3 lg:hidden" aria-label="Work order cards">
            {filtered.map((wo) => (
              <WorkOrderCard key={wo.id} workOrder={wo} />
            ))}
          </div>
        </>
      ) : (
        <WorkOrderListTable workOrders={filtered} />
      )}

      <NewWorkOrderModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

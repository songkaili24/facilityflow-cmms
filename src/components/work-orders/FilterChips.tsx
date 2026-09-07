"use client";

import { useOpsStore, type WorkOrderFilter } from "@/lib/store";
import { WORK_ORDER_CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Filter chips for the work order board — category chips plus an "All open"
 * reset. Selection lives in the ops store so mobile list, kanban, and
 * counters stay in sync.
 */
export function FilterChips() {
  const filter = useOpsStore((s) => s.filter);
  const setFilter = useOpsStore((s) => s.setFilter);

  return (
    <div
      role="group"
      aria-label="Filter work orders"
      className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
    >
      <Chip label="All open" selected={filter === "active"} onClick={() => setFilter("active")} />
      {WORK_ORDER_CATEGORIES.map((category) => (
        <Chip
          key={category}
          label={category}
          selected={filter === category}
          onClick={() => setFilter(filter === category ? "active" : category)}
        />
      ))}
    </div>
  );
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "focus-ring min-h-12 shrink-0 rounded-full border-2 px-4 text-sm font-semibold transition-colors",
        selected
          ? "border-accent bg-accent/10 text-accent"
          : "border-charcoal-200 bg-card text-charcoal-600 hover:border-charcoal-300"
      )}
    >
      {label}
    </button>
  );
}

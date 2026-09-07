"use client";

import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { selectClass } from "@/components/ui/formControls";
import { PRIORITY_META, STATUS_META, KANBAN_COLUMNS } from "@/lib/statuses";
import { useOpsStore } from "@/lib/store";
import { useTechnicians, useVendors } from "@/lib/hooks";
import { WORK_ORDER_CATEGORIES, type WorkOrderStatus } from "@/lib/types";

const FACET_LABELS = {
  priorities: "Priority",
  categories: "Category",
  statuses: "Status",
  assignees: "Assignee",
} as const;

/** Dropdown filter bar: priority, category, status, assignee. */
export function FilterBar() {
  const filters = useOpsStore((s) => s.filters);
  const setFilter = useOpsStore((s) => s.setFilter);
  const clearFilters = useOpsStore((s) => s.clearFilters);
  const { technicians } = useTechnicians();
  const { vendors } = useVendors();

  const select = (
    facet: keyof typeof FACET_LABELS,
    label: string,
    options: { value: string; label: string }[]
  ) => {
    const current = filters[facet][0] ?? "";
    return (
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-charcoal-500">
          {label}
        </span>
        <select
          value={current}
          onChange={(e) => setFilter(facet, e.target.value ? [e.target.value] : [])}
          className={selectClass}
        >
          <option value="">All</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    );
  };

  const hasFilters =
    filters.query !== "" ||
    filters.priorities.length > 0 ||
    filters.categories.length > 0 ||
    filters.statuses.length > 0 ||
    filters.assignees.length > 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {select(
          "priorities",
          FACET_LABELS.priorities,
          (Object.keys(PRIORITY_META) as (keyof typeof PRIORITY_META)[]).map((p) => ({
            value: p,
            label: PRIORITY_META[p].label,
          }))
        )}
        {select(
          "categories",
          FACET_LABELS.categories,
          WORK_ORDER_CATEGORIES.map((c) => ({ value: c, label: c }))
        )}
        {select(
          "statuses",
          FACET_LABELS.statuses,
          KANBAN_COLUMNS.map(({ status }) => ({ value: status, label: STATUS_META[status].label }))
        )}
        {select("assignees", FACET_LABELS.assignees, [
          ...technicians.map((t) => ({ value: t.id, label: `${t.name} (in-house)` })),
          ...vendors.map((v) => ({ value: v.id, label: `${v.name} (vendor)` })),
        ])}
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <FilterX aria-hidden className="mr-2 h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
  );
}

/** Exposed for the list view header badges. */
export function statusLabel(status: WorkOrderStatus): string {
  return STATUS_META[status].label;
}

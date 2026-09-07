"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Skeleton } from "@/components/ui/Skeleton";
import { selectClass } from "@/components/ui/formControls";
import { useInventory, useSimulatedLoading, useVendors } from "@/lib/hooks";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import { PART_CATEGORIES, stockStatusOf, type InventoryItem, type StockStatus } from "@/lib/types";
import { RequisitionModal } from "./RequisitionModal";

const STOCK_BADGE: Record<StockStatus, "success" | "warning" | "danger"> = {
  in_stock: "success",
  low_stock: "warning",
  out_of_stock: "danger",
} as const;

const STOCK_LABEL: Record<StockStatus, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
} as const;

/** /inventory — parts storeroom: stock levels, reorder points, suppliers. */
export function InventoryView() {
  const { inventory } = useInventory();
  const { vendors, isLoading: vendorsLoading } = useVendors();
  const loading = useSimulatedLoading(300) || vendorsLoading;

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [requisitionTarget, setRequisitionTarget] = useState<InventoryItem | null>(null);

  const vendorName = (id: string) => vendors.find((v) => v.id === id)?.name ?? "—";

  const stats = useMemo(
    () => ({
      skus: inventory.length,
      low: inventory.filter((i) => stockStatusOf(i) === "low_stock").length,
      out: inventory.filter((i) => stockStatusOf(i) === "out_of_stock").length,
      value: inventory.reduce((sum, i) => sum + i.quantity * i.unitCost, 0),
    }),
    [inventory]
  );

  const filtered = inventory.filter((item: InventoryItem) => {
    if (category && item.category !== category) return false;
    if (status && stockStatusOf(item) !== status) return false;
    const q = query.trim().toLowerCase();
    if (q && !`${item.sku} ${item.name} ${item.location}`.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Parts Inventory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Storeroom stock levels with reorder thresholds — requisitions debit on-hand counts
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "SKUs tracked", value: String(stats.skus) },
          {
            label: "Low stock",
            value: String(stats.low),
            tone: stats.low > 0 ? "warning" : undefined,
          },
          {
            label: "Out of stock",
            value: String(stats.out),
            tone: stats.out > 0 ? "danger" : undefined,
          },
          { label: "Stock value", value: formatMoney(stats.value) },
        ].map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "rounded-xl border border-l-4 border-border bg-card p-4 shadow-card",
              stat.tone === "warning" && "border-l-warning",
              stat.tone === "danger" && "border-l-danger",
              !stat.tone && "border-l-charcoal-400"
            )}
          >
            <dt className="text-xs font-bold uppercase tracking-widest text-charcoal-500">
              {stat.label}
            </dt>
            <dd className="mt-1 font-heading text-2xl font-extrabold">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
        <SearchInput
          value={query}
          onChange={setQuery}
          label="Search inventory by SKU, name, or bin"
          placeholder="Search SKU, part name, or bin location…"
        />
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-charcoal-500">
            Category
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={selectClass}
          >
            <option value="">All categories</option>
            {PART_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-charcoal-500">
            Stock status
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={selectClass}
          >
            <option value="">Any status</option>
            <option value="in_stock">In stock</option>
            <option value="low_stock">Low stock</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </label>
      </div>

      {loading ? (
        <InventorySkeleton />
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-charcoal-200 bg-card p-10 text-center text-sm text-muted-foreground shadow-card">
          No parts match this search.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
          <table className="w-full min-w-[60rem] text-left text-sm">
            <caption className="sr-only">Inventory items matching the current filters</caption>
            <thead>
              <tr className="border-b border-border bg-muted/60 text-xs font-bold uppercase tracking-widest text-charcoal-500">
                <th scope="col" className="px-4 py-3">
                  SKU
                </th>
                <th scope="col" className="px-4 py-3">
                  Part
                </th>
                <th scope="col" className="px-4 py-3">
                  Category
                </th>
                <th scope="col" className="px-4 py-3">
                  On hand
                </th>
                <th scope="col" className="px-4 py-3">
                  Reorder at
                </th>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
                <th scope="col" className="px-4 py-3">
                  Supplier
                </th>
                <th scope="col" className="px-4 py-3">
                  Counted
                </th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const stock = stockStatusOf(item);
                const lowOrOut = stock !== "in_stock";
                return (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-b-0 hover:bg-muted/40"
                  >
                    <th scope="row" className="px-4 py-3 font-mono font-bold text-charcoal-700">
                      {item.sku}
                    </th>
                    <td className="max-w-56 px-4 py-3">
                      <span className="block truncate font-semibold text-charcoal-800">
                        {item.name}
                      </span>
                      <span className="block truncate text-xs text-charcoal-400">
                        {item.location}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">{item.category}</td>
                    <td
                      className={cn(
                        "px-4 py-3 font-bold tabular-nums",
                        stock === "out_of_stock" && "text-danger",
                        stock === "low_stock" && "text-warning-foreground"
                      )}
                    >
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-charcoal-500">
                      {item.reorderThreshold}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STOCK_BADGE[stock]} withDot>
                        {STOCK_LABEL[stock]}
                      </Badge>
                    </td>
                    <td className="max-w-40 px-4 py-3">
                      <Link
                        href={`/vendors/${item.supplierId}`}
                        className="focus-ring block truncate rounded font-semibold text-accent underline-offset-2 hover:underline"
                      >
                        {vendorName(item.supplierId)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-charcoal-500" suppressHydrationWarning>
                      {formatDate(item.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant={lowOrOut ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setRequisitionTarget(item)}
                      >
                        <PackageOpen aria-hidden className="mr-1.5 h-4 w-4" />
                        Requisition
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <RequisitionModal item={requisitionTarget} onClose={() => setRequisitionTarget(null)} />
    </div>
  );
}

function InventorySkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading inventory"
      className="space-y-2 rounded-xl border border-border bg-card p-4 shadow-card"
    >
      {[68, 96, 84, 90, 72, 88].map((w, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="hidden h-9 w-24 sm:block" />
        </div>
      ))}
      <span className="sr-only">Loading parts inventory…</span>
    </div>
  );
}

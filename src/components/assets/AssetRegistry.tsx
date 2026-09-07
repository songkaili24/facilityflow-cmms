"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { selectClass } from "@/components/ui/formControls";
import { useAssets, useWorkOrders } from "@/lib/hooks";
import { warrantyStatus } from "@/lib/utils";
import { cn, formatDate, formatLocation } from "@/lib/utils";
import { AddAssetModal } from "./AddAssetModal";
import type { WorkOrderCategory } from "@/lib/types";

const WARRANTY_BADGE = {
  Active: "success",
  Expiring: "warning",
  Expired: "danger",
  None: "neutral",
} as const;

/** /assets — asset registry table with category/warranty filters and add form. */
export function AssetRegistry() {
  const { assets } = useAssets();
  const { workOrders } = useWorkOrders();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [warranty, setWarranty] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const categories = useMemo(() => [...new Set(assets.map((a) => a.category))].sort(), [assets]);

  const openJobCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const wo of workOrders) {
      if (!wo.assetId || wo.status === "completed" || wo.status === "verified") continue;
      counts.set(wo.assetId, (counts.get(wo.assetId) ?? 0) + 1);
    }
    return counts;
  }, [workOrders]);

  const filtered = assets.filter((a) => {
    if (category && a.category !== category) return false;
    if (warranty && warrantyStatus(a.warrantyEnds) !== warranty) return false;
    const q = query.trim().toLowerCase();
    if (
      q &&
      !`${a.tag} ${a.name} ${a.manufacturer} ${a.model} ${a.location.building}`
        .toLowerCase()
        .includes(q)
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Asset Registry</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {assets.length} registered assets · criticality drives PM frequency and SLA tier
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setAddOpen(true)}>
          <Plus aria-hidden className="mr-2 h-5 w-5" />
          Add Asset
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_180px]">
        <SearchInput
          value={query}
          onChange={setQuery}
          label="Search assets"
          placeholder="Search tag, name, manufacturer, building…"
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
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-charcoal-500">
            Warranty
          </span>
          <select
            value={warranty}
            onChange={(e) => setWarranty(e.target.value)}
            className={selectClass}
          >
            <option value="">Any status</option>
            <option value="Active">Active</option>
            <option value="Expiring">Expiring (≤90d)</option>
            <option value="Expired">Expired</option>
            <option value="None">No warranty</option>
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <caption className="sr-only">Building assets matching the current filters</caption>
          <thead>
            <tr className="border-b border-border bg-muted/60 text-xs font-bold uppercase tracking-widest text-charcoal-500">
              <th scope="col" className="px-4 py-3">
                Tag
              </th>
              <th scope="col" className="px-4 py-3">
                Asset
              </th>
              <th scope="col" className="px-4 py-3">
                Category
              </th>
              <th scope="col" className="px-4 py-3">
                Location
              </th>
              <th scope="col" className="px-4 py-3">
                Installed
              </th>
              <th scope="col" className="px-4 py-3">
                Warranty
              </th>
              <th scope="col" className="px-4 py-3">
                Open WOs
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((asset) => {
              const wStat = warrantyStatus(asset.warrantyEnds);
              return (
                <tr
                  key={asset.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/40"
                >
                  <th scope="row" className="px-4 py-3">
                    <Link
                      href={`/assets/${asset.id}`}
                      className="focus-ring rounded font-mono font-bold text-accent underline-offset-2 hover:underline"
                    >
                      {asset.tag}
                    </Link>
                  </th>
                  <td className="max-w-64 px-4 py-3">
                    <Link
                      href={`/assets/${asset.id}`}
                      className="focus-ring block truncate rounded font-semibold text-charcoal-800 underline-offset-2 hover:underline"
                    >
                      {asset.name}
                    </Link>
                    <span className="block text-xs text-charcoal-400">
                      {asset.manufacturer} {asset.model}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={asset.criticality === "critical" ? "critical" : "neutral"}>
                      {asset.category}
                    </Badge>
                  </td>
                  <td className="max-w-44 truncate px-4 py-3 text-charcoal-600">
                    {formatLocation(asset.location)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-charcoal-600">
                    {formatDate(asset.installedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={WARRANTY_BADGE[wStat]}>
                      {wStat}
                      {wStat === "Expiring" && asset.warrantyEnds
                        ? ` · ${formatDate(asset.warrantyEnds)}`
                        : ""}
                    </Badge>
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 font-bold tabular-nums",
                      (openJobCount.get(asset.id) ?? 0) > 0 ? "text-accent" : "text-charcoal-400"
                    )}
                  >
                    {openJobCount.get(asset.id) ?? 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-charcoal-200 bg-card p-10 text-center text-sm text-muted-foreground shadow-card">
          No assets match this search.
        </p>
      )}

      <AddAssetModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

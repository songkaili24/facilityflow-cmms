"use client";

import { useMemo } from "react";
import Link from "next/link";
import { QrCode } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatusDot } from "@/components/ui/StatusIndicator";
import { useAssets, useTechnicianLookup, useWorkOrders } from "@/lib/hooks";
import { cn, formatDate, formatLocation, formatRelative, warrantyStatus } from "@/lib/utils";
import type { AssetCriticality } from "@/lib/types";

const CRITICALITY_BADGE: Record<AssetCriticality, "critical" | "high" | "medium" | "low"> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
};

const WARRANTY_BADGE = {
  Active: "success",
  Expiring: "warning",
  Expired: "danger",
  None: "neutral",
} as const;

/** Asset detail — identity, QR tag placeholder, PM history, linked work orders. */
export function AssetDetailView({ assetId }: { assetId: string }) {
  const { assets } = useAssets();
  const { workOrders } = useWorkOrders();
  const { technicianName } = useTechnicianLookup();

  const asset = assets.find((a) => a.id === assetId);
  const linked = useMemo(
    () =>
      workOrders
        .filter((wo) => wo.assetId === assetId)
        .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()),
    [workOrders, assetId]
  );

  if (!asset) {
    return (
      <div className="rounded-xl border border-dashed border-charcoal-200 bg-card p-10 text-center shadow-card">
        <h1 className="font-heading text-xl font-bold">Asset not found</h1>
        <Link href="/assets" className="mt-3 inline-block">
          <Button variant="outline" size="md">
            Back to registry
          </Button>
        </Link>
      </div>
    );
  }

  const wStat = warrantyStatus(asset.warrantyEnds);

  return (
    <div className="space-y-4">
      <Link
        href="/assets"
        className="focus-ring inline-flex min-h-12 items-center gap-1 rounded-lg text-sm font-semibold text-charcoal-600 hover:text-charcoal-900"
      >
        ← Back to registry
      </Link>

      <header className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-charcoal-500">{asset.tag}</span>
              <Badge variant={CRITICALITY_BADGE[asset.criticality]}>
                {asset.criticality} criticality
              </Badge>
              <Badge variant={WARRANTY_BADGE[wStat]}>Warranty: {wStat}</Badge>
            </div>
            <h1 className="mt-2 font-heading text-2xl font-bold">{asset.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {asset.manufacturer} {asset.model} · {formatLocation(asset.location)}
            </p>
          </div>

          {/* QR tagging placeholder */}
          <div
            className="flex flex-col items-center gap-1 rounded-lg border-2 border-dashed border-charcoal-200 p-3"
            aria-label="QR tag placeholder"
          >
            <QrCode aria-hidden className="h-14 w-14 text-charcoal-300" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400">
              QR tag
            </span>
            <span className="text-[10px] text-charcoal-400">{asset.tag}</span>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
              Installed
            </dt>
            <dd className="mt-0.5 font-bold">{formatDate(asset.installedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
              Warranty ends
            </dt>
            <dd className="mt-0.5 font-bold">
              {asset.warrantyEnds ? formatDate(asset.warrantyEnds) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
              Last service
            </dt>
            <dd className="mt-0.5 font-bold" suppressHydrationWarning>
              {asset.lastServiceAt ? formatRelative(asset.lastServiceAt) : "No record"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
              Open work orders
            </dt>
            <dd className="mt-0.5 font-bold">
              {linked.filter((wo) => wo.status !== "completed" && wo.status !== "verified").length}
            </dd>
          </div>
        </dl>
      </header>

      <section
        className="rounded-xl border border-border bg-card p-5 shadow-card"
        aria-label="Linked work orders and maintenance history"
      >
        <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500">
          Maintenance history — linked work orders
        </h2>
        {linked.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No work orders reference this asset yet.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-border">
            {linked.map((wo) => {
              const assignee = technicianName(wo.assigneeId);
              return (
                <li key={wo.id}>
                  <Link
                    href={`/workorders/${wo.id}`}
                    className="focus-ring flex min-h-12 flex-wrap items-center gap-x-3 gap-y-1 rounded px-1 py-2 hover:bg-muted"
                  >
                    <StatusDot status={wo.status} />
                    <span className="font-mono text-xs font-bold text-charcoal-500">
                      {wo.number}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-charcoal-800">
                      {wo.title}
                    </span>
                    <span className="text-xs text-charcoal-500">{assignee}</span>
                    <time
                      dateTime={wo.reportedAt}
                      suppressHydrationWarning
                      className={cn(
                        "text-xs",
                        wo.status === "completed" || wo.status === "verified"
                          ? "text-charcoal-400"
                          : new Date(wo.dueAt).getTime() < Date.now()
                            ? "font-semibold text-danger"
                            : "text-charcoal-400"
                      )}
                    >
                      {formatRelative(wo.reportedAt)}
                    </time>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

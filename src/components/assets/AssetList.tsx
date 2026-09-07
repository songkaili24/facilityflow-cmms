"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useAssets } from "@/lib/hooks";
import type { AssetCriticality } from "@/lib/types";

const CRITICALITY_BADGE: Record<AssetCriticality, "critical" | "high" | "medium" | "low"> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
};

export default function AssetList() {
  const { assets } = useAssets();

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {assets.map((asset) => (
        <li key={asset.id}>
          <article className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs font-bold text-charcoal-400">{asset.tag}</p>
                <h2 className="font-heading text-lg font-bold leading-snug">{asset.name}</h2>
              </div>
              <Badge variant={CRITICALITY_BADGE[asset.criticality]}>{asset.criticality}</Badge>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {asset.location} · Floor {asset.floor}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
                  Make / model
                </dt>
                <dd className="mt-0.5 font-semibold">
                  {asset.manufacturer} {asset.model}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
                  Installed
                </dt>
                <dd className="mt-0.5 font-semibold">{asset.installedYear}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
                  Last service
                </dt>
                <dd className="mt-0.5 font-semibold">
                  {asset.lastServiceDate
                    ? new Date(asset.lastServiceDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "No record"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
                  Open work orders
                </dt>
                <dd className="mt-0.5 font-bold">{asset.openWorkOrderCount}</dd>
              </div>
            </dl>

            {asset.warrantyEnds && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 md:mt-auto">
                <AlertTriangle aria-hidden className="h-4 w-4 text-warning" />
                Warranty ends{" "}
                {new Date(asset.warrantyEnds).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </article>
        </li>
      ))}
    </ul>
  );
}

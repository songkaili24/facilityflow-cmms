"use client";

import { PhoneCall, ShieldCheck, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useVendors } from "@/lib/hooks";

const TRADE_BADGE: Record<string, "info" | "warning" | "success" | "neutral"> = {
  HVAC: "info",
  Electrical: "warning",
  Plumbing: "info",
  Elevators: "neutral",
  Janitorial: "neutral",
  General: "neutral",
};

export default function VendorList() {
  const { vendors } = useVendors();

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {vendors.map((vendor) => (
        <li key={vendor.id}>
          <article className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold">{vendor.name}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">{vendor.contactName}</p>
              </div>
              {vendor.preferred && (
                <Badge variant="success" withDot>
                  Preferred
                </Badge>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {vendor.trades.map((trade) => (
                <Badge key={trade} variant={TRADE_BADGE[trade] ?? "neutral"}>
                  {trade}
                </Badge>
              ))}
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
                  Rating
                </dt>
                <dd className="mt-0.5 flex items-center gap-1 font-bold">
                  <Star aria-hidden className="h-4 w-4 fill-warning text-warning" />
                  {vendor.rating.toFixed(1)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
                  Response SLA
                </dt>
                <dd className="mt-0.5 font-bold">{vendor.slaResponseHours}h on-site</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
                  Phone
                </dt>
                <dd className="mt-0.5 font-semibold">{vendor.phone}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
                  Contract ends
                </dt>
                <dd className="mt-0.5 font-semibold">
                  {new Date(vendor.contractEnd).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex gap-3 pt-2 md:mt-auto">
              <a
                href={`tel:${vendor.phone.replace(/[^+\d]/g, "")}`}
                className="tap-target focus-ring flex-1 rounded-lg border border-input bg-card text-center text-sm font-semibold hover:bg-muted"
              >
                <PhoneCall aria-hidden className="mr-2 inline h-4 w-4 text-accent" />
                Call Dispatch
              </a>
              <a
                href={`mailto:${vendor.email}`}
                className="tap-target focus-ring flex-1 rounded-lg bg-charcoal-800 text-center text-sm font-semibold text-charcoal-50 hover:bg-charcoal-700"
              >
                Email Work Order
              </a>
            </div>

            {vendor.slaResponseHours <= 2 && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-charcoal-500">
                <ShieldCheck aria-hidden className="h-4 w-4 text-success" />
                Critical-response vendor — entrapment &amp; life safety calls
              </p>
            )}
          </article>
        </li>
      ))}
    </ul>
  );
}

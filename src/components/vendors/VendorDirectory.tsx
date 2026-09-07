"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Star, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { selectClass } from "@/components/ui/formControls";
import { Skeleton } from "@/components/ui/Skeleton";
import { useVendors, useWorkOrders } from "@/lib/hooks";
import type { VendorSpecialty } from "@/lib/types";
import { DispatchVendorModal } from "./VendorViews";

const SPECIALTIES: readonly VendorSpecialty[] = [
  "HVAC",
  "Electrical",
  "Plumbing",
  "Elevator",
  "Fire Safety",
  "Landscaping",
];

const CONTRACT_BADGE = {
  Active: "success",
  "Renewal due": "warning",
  Expiring: "danger",
} as const;

/** /vendors — searchable directory with specialty filters and quick dispatch. */
export function VendorDirectory() {
  const { vendors, isLoading: vendorsLoading } = useVendors();
  const { workOrders } = useWorkOrders();
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [dispatchTarget, setDispatchTarget] = useState<string | null>(null);

  const activeJobCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const wo of workOrders) {
      if (!wo.vendorId || wo.status === "completed" || wo.status === "verified") continue;
      counts.set(wo.vendorId, (counts.get(wo.vendorId) ?? 0) + 1);
    }
    return counts;
  }, [workOrders]);

  const filtered = vendors.filter((v) => {
    if (specialty && v.specialty !== specialty) return false;
    const q = query.trim().toLowerCase();
    if (q && !`${v.name} ${v.specialty} ${v.contactName}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const dispatchVendor = vendors.find((v) => v.id === dispatchTarget) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Vendor Directory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Approved service partners · response SLAs are contractual
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <SearchInput
          value={query}
          onChange={setQuery}
          label="Search vendors by name or service type"
          placeholder="Search vendor name or service type…"
        />
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-charcoal-500">
            Specialty
          </span>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className={selectClass}
          >
            <option value="">All specialties</option>
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {vendorsLoading ? (
        <div aria-busy="true" aria-label="Loading vendors" className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton rounded="full" className="h-6 w-24" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-10" />
                ))}
              </div>
              <Skeleton className="mt-4 h-12 w-full" />
            </div>
          ))}
          <span className="sr-only">Loading vendor directory…</span>
        </div>
      ) : (
        <>
          <ul className="grid gap-4 md:grid-cols-2">
            {filtered.map((vendor) => (
              <li key={vendor.id}>
                <article className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-heading text-lg font-bold">
                        <Link
                          href={`/vendors/${vendor.id}`}
                          className="focus-ring rounded underline-offset-2 hover:underline"
                        >
                          {vendor.name}
                        </Link>
                      </h2>
                      <p className="mt-0.5 text-sm text-muted-foreground">{vendor.contactName}</p>
                    </div>
                    <Badge variant={CONTRACT_BADGE[vendor.contractStatus]}>
                      {vendor.specialty}
                    </Badge>
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
                        Response
                      </dt>
                      <dd className="mt-0.5 font-bold">{vendor.responseTargetHours}h SLA</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
                        Open jobs
                      </dt>
                      <dd className="mt-0.5 font-bold">{activeJobCount.get(vendor.id) ?? 0}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
                        SLA compliance
                      </dt>
                      <dd className="mt-0.5 font-bold">{vendor.slaCompliancePct}%</dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4 md:mt-auto">
                    <a
                      href={`tel:${vendor.phone.replace(/[^+\d]/g, "")}`}
                      className="focus-ring inline-flex min-h-12 flex-1 items-center justify-center rounded-lg border border-input bg-card text-sm font-semibold hover:bg-muted"
                    >
                      Call
                    </a>
                    <Button
                      variant="secondary"
                      size="md"
                      className="flex-1"
                      onClick={() => setDispatchTarget(vendor.id)}
                    >
                      <Wrench aria-hidden className="mr-2 h-4 w-4" />
                      Dispatch
                    </Button>
                    <Link
                      href={`/vendors/${vendor.id}`}
                      className="focus-ring inline-flex min-h-12 flex-1 items-center justify-center rounded-lg bg-charcoal-800 text-sm font-semibold text-white hover:bg-charcoal-700"
                    >
                      Profile
                      <ChevronRight aria-hidden className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>

          {filtered.length === 0 && (
            <p className="rounded-xl border border-dashed border-charcoal-200 bg-card p-10 text-center text-sm text-muted-foreground shadow-card">
              No vendors match this search.
            </p>
          )}
        </>
      )}

      <DispatchVendorModal vendor={dispatchVendor} onClose={() => setDispatchTarget(null)} />
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Wrench } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatusDot } from "@/components/ui/StatusIndicator";
import { useToast } from "@/components/ui/Toast";
import { selectClass } from "@/components/ui/formControls";
import { STATUS_META } from "@/lib/statuses";
import { useOpsStore } from "@/lib/store";
import { useVendors, useWorkOrders } from "@/lib/hooks";
import { cn, formatRelative } from "@/lib/utils";
import type { Vendor } from "@/lib/types";

/** Quick "Dispatch Vendor" flow — pick an open work order for this vendor. */
export function DispatchVendorModal({
  vendor,
  onClose,
}: {
  vendor: Vendor | null;
  onClose: () => void;
}) {
  const { workOrders } = useWorkOrders();
  const dispatchVendor = useOpsStore((s) => s.dispatchVendor);
  const { toast } = useToast();
  const [selectedWo, setSelectedWo] = useState("");
  const [ack, setAck] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  // Re-sync the confirmation address each time a vendor is picked.
  useEffect(() => {
    setConfirmEmail(vendor?.email ?? "");
    setAck(false);
  }, [vendor]);
  const emailFormatOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(confirmEmail.trim());

  const openJobs = useMemo(
    () =>
      workOrders.filter(
        (wo) => wo.vendorId === vendor?.id && wo.status !== "completed" && wo.status !== "verified"
      ),
    [workOrders, vendor]
  );
  const unassigned = useMemo(
    () => workOrders.filter((wo) => wo.status === "reported" && wo.vendorId === null),
    [workOrders]
  );

  if (!vendor) return null;

  const dispatch = () => {
    const wo = workOrders.find((w) => w.id === selectedWo);
    if (!wo || !vendor || !ack || !emailFormatOk) return;
    dispatchVendor(wo.id, vendor.id);
    toast({
      title: `${vendor.name} dispatched`,
      description: `${wo.number} assigned — confirmation sent to ${confirmEmail.trim()}. Response SLA acknowledged (${vendor.responseTargetHours}h).`,
      variant: "success",
    });
    setSelectedWo("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dispatch-vendor-title"
      className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-charcoal-900/70 sm:items-center sm:p-6"
    >
      <div className="w-full max-w-md animate-slide-up rounded-t-2xl bg-card p-6 shadow-popped sm:rounded-2xl">
        <h2 id="dispatch-vendor-title" className="font-heading text-xl font-bold">
          Dispatch {vendor.name}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick an open work order to route. Response SLA target: {vendor.responseTargetHours}h
          on-site.
        </p>

        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-charcoal-600">
            Work order
          </span>
          <select
            value={selectedWo}
            onChange={(e) => setSelectedWo(e.target.value)}
            className={selectClass}
          >
            <option value="">Select work order…</option>
            {openJobs.map((wo) => (
              <option key={wo.id} value={wo.id}>
                {wo.number} — {wo.title}
              </option>
            ))}
            {unassigned.slice(0, 4).map((wo) => (
              <option key={wo.id} value={wo.id}>
                {wo.number} — {wo.title} (unrouted)
              </option>
            ))}
          </select>
        </label>

        {selectedWo && (
          <div className="mt-4 space-y-3 rounded-lg border border-border bg-muted/50 p-4">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-charcoal-600">
                Dispatch confirmation email
              </span>
              <input
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                aria-invalid={!emailFormatOk}
                className={
                  emailFormatOk
                    ? "focus-ring min-h-12 w-full rounded-lg border border-input bg-card px-3 text-base"
                    : "focus-ring min-h-12 w-full rounded-lg border border-danger bg-card px-3 text-base"
                }
                required
              />
              {!emailFormatOk && confirmEmail.length > 0 && (
                <span className="mt-1 block text-sm font-medium text-danger">
                  Enter a valid contact email (name@company.com).
                </span>
              )}
            </label>

            <label className="flex min-h-12 items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-3">
              <input
                type="checkbox"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
                className="mt-1 h-5 w-5"
                required
              />
              <span className="text-sm leading-snug text-charcoal-700">
                I acknowledge the {vendor.responseTargetHours}-hour on-site response SLA for{" "}
                {vendor.name} and the emergency escalation terms of the service contract.
              </span>
            </label>
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={dispatch}
            disabled={!selectedWo || !ack || !emailFormatOk}
          >
            <Wrench aria-hidden className="mr-2 h-5 w-5" />
            Dispatch
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Contract, SLA, quality, and volume scorecard. */
export function VendorScorecard({ vendor, className }: { vendor: Vendor; className?: string }) {
  const bars = [
    { label: "SLA compliance", value: vendor.slaCompliancePct, suffix: "%" },
    { label: "Quality score", value: vendor.qualityScore, suffix: "/100" },
    {
      label: "Avg. response vs. target",
      value: Math.max(
        0,
        Math.min(
          100,
          Math.round((1 - vendor.avgResponseHours / Math.max(vendor.responseTargetHours, 1)) * 100)
        )
      ),
      suffix: "% within target",
    },
  ];

  return (
    <section
      className={cn("rounded-xl border border-border bg-card p-5 shadow-card", className)}
      aria-label="Performance scorecard"
    >
      <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500">
        Performance scorecard — 90 days
      </h2>
      <dl className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-xs text-charcoal-500">Completed jobs</dt>
          <dd className="font-heading text-2xl font-extrabold">{vendor.completedJobs90d}</dd>
        </div>
        <div>
          <dt className="text-xs text-charcoal-500">Rating</dt>
          <dd className="font-heading text-2xl font-extrabold">{vendor.rating.toFixed(1)} ★</dd>
        </div>
      </dl>
      <div className="mt-4 space-y-3">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="flex items-center justify-between text-xs font-bold text-charcoal-600">
              <span>{bar.label}</span>
              <span className="tabular-nums">
                {bar.value}
                {bar.suffix}
              </span>
            </div>
            <div
              className="mt-1 h-2 overflow-hidden rounded-full bg-charcoal-100"
              role="presentation"
            >
              <div
                className={cn(
                  "h-full rounded-full",
                  bar.value >= 90 ? "bg-success" : bar.value >= 75 ? "bg-warning" : "bg-danger"
                )}
                style={{ width: `${Math.min(100, bar.value)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Vendor detail body — scorecard, contract, active jobs, history. */
export function VendorDetailView({ vendorId }: { vendorId: string }) {
  const { vendors } = useVendors();
  const { workOrders } = useWorkOrders();
  const [dispatchOpen, setDispatchOpen] = useState(false);

  const vendor = vendors.find((v) => v.id === vendorId);
  if (!vendor) {
    return (
      <div className="rounded-xl border border-dashed border-charcoal-200 bg-card p-10 text-center shadow-card">
        <h1 className="font-heading text-xl font-bold">Vendor not found</h1>
        <Link href="/vendors" className="mt-3 inline-block">
          <Button variant="outline" size="md">
            Back to directory
          </Button>
        </Link>
      </div>
    );
  }

  const activeJobs = workOrders.filter(
    (wo) => wo.vendorId === vendor.id && wo.status !== "completed" && wo.status !== "verified"
  );
  const completedJobs = workOrders.filter(
    (wo) => wo.vendorId === vendor.id && (wo.status === "completed" || wo.status === "verified")
  );

  return (
    <div className="space-y-4">
      <Link
        href="/vendors"
        className="focus-ring inline-flex min-h-12 items-center gap-1 rounded-lg text-sm font-semibold text-charcoal-600 hover:text-charcoal-900"
      >
        ← Back to directory
      </Link>

      <header className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">{vendor.specialty}</Badge>
              <Badge
                variant={
                  vendor.contractStatus === "Active"
                    ? "success"
                    : vendor.contractStatus === "Renewal due"
                      ? "warning"
                      : "danger"
                }
              >
                Contract: {vendor.contractStatus}
              </Badge>
            </div>
            <h1 className="mt-2 font-heading text-2xl font-bold">{vendor.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {vendor.contactName} · {vendor.phone} · {vendor.email}
            </p>
          </div>
          <Button variant="primary" size="lg" onClick={() => setDispatchOpen(true)}>
            <Wrench aria-hidden className="mr-2 h-5 w-5" />
            Dispatch Vendor
          </Button>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
              Response SLA
            </dt>
            <dd className="mt-0.5 font-bold">{vendor.responseTargetHours}h target</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
              Avg. response
            </dt>
            <dd className="mt-0.5 font-bold">{vendor.avgResponseHours}h</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
              Contract ends
            </dt>
            <dd className="mt-0.5 font-bold">
              {new Date(vendor.contractEnd).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
              Jobs (90d)
            </dt>
            <dd className="mt-0.5 font-bold">{vendor.completedJobs90d}</dd>
          </div>
        </dl>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <VendorScorecard vendor={vendor} />

        <section
          className="rounded-xl border border-border bg-card p-5 shadow-card"
          aria-label="Active work orders"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500">
            Active work orders
          </h2>
          {activeJobs.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No open jobs with this vendor.</p>
          ) : (
            <ul className="mt-2 divide-y divide-border">
              {activeJobs.map((wo) => (
                <li key={wo.id}>
                  <Link
                    href={`/workorders/${wo.id}`}
                    className="focus-ring flex min-h-12 items-center gap-2 rounded px-1 hover:bg-muted"
                  >
                    <StatusDot status={wo.status} />
                    <span className="font-mono text-xs font-bold text-charcoal-500">
                      {wo.number}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-charcoal-800">
                      {wo.title}
                    </span>
                    <span className="text-xs text-charcoal-400">
                      {STATUS_META[wo.status].label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <h2 className="mt-4 text-xs font-bold uppercase tracking-widest text-charcoal-500">
            Recently completed
          </h2>
          {completedJobs.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No completions logged in this demo window.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-border">
              {completedJobs.map((wo) => (
                <li key={wo.id}>
                  <Link
                    href={`/workorders/${wo.id}`}
                    className="focus-ring flex min-h-12 items-center gap-2 rounded px-1 hover:bg-muted"
                  >
                    <span className="font-mono text-xs font-bold text-charcoal-500">
                      {wo.number}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-charcoal-700">
                      {wo.title}
                    </span>
                    <span className="text-xs text-charcoal-400" suppressHydrationWarning>
                      {wo.completedAt ? formatRelative(wo.completedAt) : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <DispatchVendorModal
        vendor={dispatchOpen ? vendor : null}
        onClose={() => setDispatchOpen(false)}
      />
    </div>
  );
}

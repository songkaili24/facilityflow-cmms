"use client";

import Link from "next/link";
import { Award, Clock, Mail, Phone, ShieldCheck, Timer } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatusDot } from "@/components/ui/StatusIndicator";
import { useTechnicians, useWorkOrders } from "@/lib/hooks";
import { formatDate } from "@/lib/utils";

/** /technicians/[id] — profile: certs, shift schedule, assignments, metrics. */
export function TechnicianProfile({ technicianId }: { technicianId: string }) {
  const { technicians } = useTechnicians();
  const { workOrders } = useWorkOrders();

  const tech = technicians.find((t) => t.id === technicianId);
  if (!tech) {
    return (
      <div className="rounded-xl border border-dashed border-charcoal-200 bg-card p-10 text-center shadow-card">
        <h1 className="font-heading text-xl font-bold">Technician not found</h1>
        <Link href="/technicians" className="mt-3 inline-block">
          <Button variant="outline" size="md">
            Back to directory
          </Button>
        </Link>
      </div>
    );
  }

  const assignments = workOrders
    .filter((wo) => wo.assigneeId === tech.id)
    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
  const open = assignments.filter((wo) => wo.status !== "completed" && wo.status !== "verified");

  return (
    <div className="space-y-4">
      <Link
        href="/technicians"
        className="focus-ring inline-flex min-h-12 items-center gap-1 rounded-lg text-sm font-semibold text-charcoal-600 hover:text-charcoal-900"
      >
        ← Back to directory
      </Link>

      <header className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={tech.name} hue={tech.hue} className="h-16 w-16 text-lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">{tech.shift}</Badge>
              <Badge variant={open.length > 0 ? "warning" : "success"}>
                {open.length} open assignment{open.length === 1 ? "" : "s"}
              </Badge>
            </div>
            <h1 className="mt-2 font-heading text-2xl font-bold">{tech.name}</h1>
            <p className="text-sm text-muted-foreground">{tech.role}</p>
          </div>
          <dl className="flex gap-4 text-sm">
            <div>
              <dt className="sr-only">Phone</dt>
              <dd>
                <a
                  href={`tel:${tech.phone.replace(/[^+\d]/g, "")}`}
                  className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-lg px-2 font-semibold text-charcoal-700 underline-offset-2 hover:underline"
                >
                  <Phone aria-hidden className="h-4 w-4 text-charcoal-400" />
                  {tech.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="sr-only">Email</dt>
              <dd>
                <a
                  href={`mailto:${tech.email}`}
                  className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-lg px-2 font-semibold text-charcoal-700 underline-offset-2 hover:underline"
                >
                  <Mail aria-hidden className="h-4 w-4 text-charcoal-400" />
                  <span className="max-w-44 truncate">{tech.email}</span>
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Performance metrics */}
        <section
          className="rounded-xl border border-border bg-card p-5 shadow-card"
          aria-label="Performance metrics"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500">
            Performance — last 30 days
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-charcoal-500">
                <ClipboardIcon aria-hidden className="h-3.5 w-3.5" /> Completed work orders
              </dt>
              <dd className="mt-0.5 font-heading text-2xl font-extrabold">
                {tech.performance.completed30d}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-charcoal-500">
                <Timer aria-hidden className="h-3.5 w-3.5" /> Avg. completion (MTTR)
              </dt>
              <dd className="mt-0.5 font-heading text-2xl font-extrabold">
                {tech.performance.avgCompletionHours}h
              </dd>
            </div>
          </dl>
          <div className="mt-4 space-y-3">
            <ScoreBar label="SLA compliance" value={tech.performance.slaCompliancePct} suffix="%" />
            <ScoreBar
              label="First-time fix rate"
              value={tech.performance.firstTimeFixRatePct}
              suffix="%"
            />
          </div>
        </section>

        {/* Certifications */}
        <section
          className="rounded-xl border border-border bg-card p-5 shadow-card"
          aria-label="Certifications"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500">
            Certifications &amp; licenses
          </h2>
          <ul className="mt-3 space-y-2">
            {tech.certifications.map((cert) => {
              const expiringSoon =
                cert.expiresAt !== null &&
                new Date(cert.expiresAt).getTime() - Date.now() < 90 * 86_400_000;
              return (
                <li
                  key={cert.number}
                  className="flex min-h-12 items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
                >
                  <Award aria-hidden className="h-5 w-5 shrink-0 text-accent" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-charcoal-800">
                      {cert.name}
                    </span>
                    <span className="block font-mono text-xs text-charcoal-400">{cert.number}</span>
                  </span>
                  {cert.expiresAt ? (
                    <Badge variant={expiringSoon ? "warning" : "neutral"}>
                      {expiringSoon ? "Renews " : "Exp. "}
                      {formatDate(cert.expiresAt)}
                    </Badge>
                  ) : (
                    <Badge variant="success" withDot>
                      No expiry
                    </Badge>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Shift schedule */}
        <section
          className="rounded-xl border border-border bg-card p-5 shadow-card"
          aria-label="Shift schedule"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500">
            Shift schedule
          </h2>
          <p className="mt-3 flex items-center gap-2 text-sm">
            <Clock aria-hidden className="h-4 w-4 text-charcoal-400" />
            <span className="font-bold">{tech.shift}</span>
          </p>
          <div className="mt-3 grid grid-cols-7 gap-1" aria-hidden>
            {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
              <div key={i} className="text-center">
                <span className="block text-[10px] font-bold text-charcoal-400">{day}</span>
                <span
                  className={
                    i < 5
                      ? "mt-1 block h-10 rounded bg-charcoal-800"
                      : "mt-1 block h-10 rounded border-2 border-dashed border-charcoal-200"
                  }
                />
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-charcoal-500">
            Weekday rotation — weekend call-outs route to the on-call engineer.
          </p>
        </section>

        {/* Active assignments */}
        <section
          className="rounded-xl border border-border bg-card p-5 shadow-card"
          aria-label="Active assignments"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500">
            Active assignments
          </h2>
          {open.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Board is clear — no open work orders.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-border">
              {open.map((wo) => (
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
                    <span className="text-xs font-semibold text-charcoal-500">{wo.priority}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return <ShieldCheck className={className} />;
}

function ScoreBar({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-bold text-charcoal-600">
        <span>{label}</span>
        <span className="tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-charcoal-100" role="presentation">
        <div
          className={
            value >= 90
              ? "h-full rounded-full bg-success"
              : value >= 75
                ? "h-full rounded-full bg-warning"
                : "h-full rounded-full bg-danger"
          }
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

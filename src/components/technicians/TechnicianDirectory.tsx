"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ClipboardList } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSimulatedLoading, useTechnicians, useWorkOrders } from "@/lib/hooks";
import type { Shift } from "@/lib/types";

/** /technicians — in-house crew directory with active assignment counts. */
export function TechnicianDirectory() {
  const { technicians } = useTechnicians();
  const { workOrders } = useWorkOrders();
  const loading = useSimulatedLoading(250);
  const [query, setQuery] = useState("");

  const activeCount = (techId: string) =>
    workOrders.filter(
      (wo) => wo.assigneeId === techId && wo.status !== "completed" && wo.status !== "verified"
    ).length;

  const filtered = technicians.filter((t) => {
    const q = query.trim().toLowerCase();
    return (
      !q ||
      `${t.name} ${t.role} ${t.shift} ${t.specialties.join(" ")} ${t.certifications
        .map((c) => c.name)
        .join(" ")}`
        .toLowerCase()
        .includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-3xl font-bold">Technicians</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          In-house crew — certifications, shift schedules, and active assignments
        </p>
      </div>

      <SearchInput
        value={query}
        onChange={setQuery}
        label="Search technicians by name, role, trade, or certification"
        placeholder="Search name, trade, shift, or certification…"
      />

      {loading ? (
        <div
          aria-busy="true"
          aria-label="Loading technicians"
          className="grid gap-4 md:grid-cols-2"
        >
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-3">
                <Skeleton rounded="full" className="h-12 w-12" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
          <span className="sr-only">Loading technician directory…</span>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {filtered.map((tech) => {
            const active = activeCount(tech.id);
            return (
              <li key={tech.id}>
                <article className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-card">
                  <div className="flex items-center gap-3">
                    <Avatar name={tech.name} hue={tech.hue} className="h-12 w-12 text-sm" />
                    <div className="min-w-0 flex-1">
                      <h2 className="font-heading text-lg font-bold leading-tight">
                        <Link
                          href={`/technicians/${tech.id}`}
                          className="focus-ring rounded underline-offset-2 hover:underline"
                        >
                          {tech.name}
                        </Link>
                      </h2>
                      <p className="text-sm text-muted-foreground">{tech.role}</p>
                    </div>
                    <Badge variant={active > 0 ? "info" : "neutral"} withDot>
                      {active} active
                    </Badge>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
                        Shift
                      </dt>
                      <dd className="mt-0.5 font-semibold">{tech.shift}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
                        Trades
                      </dt>
                      <dd className="mt-0.5 font-semibold">{tech.specialties.join(" · ")}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-500">
                        Certifications
                      </dt>
                      <dd className="mt-0.5 text-charcoal-600">
                        {tech.certifications.map((c) => c.name).join(" · ")}
                      </dd>
                    </div>
                  </dl>

                  <Link
                    href={`/technicians/${tech.id}`}
                    className="focus-ring mt-4 inline-flex min-h-12 items-center gap-1 rounded-lg text-sm font-bold uppercase tracking-wide text-accent md:mt-auto"
                  >
                    <ClipboardList aria-hidden className="h-4 w-4" />
                    View profile
                    <ChevronRight aria-hidden className="h-4 w-4" />
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-charcoal-200 bg-card p-10 text-center text-sm text-muted-foreground shadow-card">
          No technicians match this search.
        </p>
      )}
    </div>
  );
}

export const SHIFTS: readonly Shift[] = [
  "Day (07:00–15:30)",
  "Swing (15:00–23:30)",
  "Night (23:00–07:30)",
];

"use client";

import { Mail, Phone, Timer } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useTechnicianLookup } from "@/lib/hooks";
import type { Technician } from "@/lib/types";

/** Assigned technician card with contact info and shift schedule. */
export function TechnicianCard({ technicianId }: { technicianId: string | null }) {
  const { technicianById } = useTechnicianLookup();
  const tech: Technician | null = technicianById(technicianId);

  if (!tech) {
    return (
      <section
        className="rounded-xl border-2 border-dashed border-charcoal-200 p-4"
        aria-label="Assigned technician"
      >
        <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500">
          Assigned technician
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No technician assigned yet — use the status controls to assign or dispatch a vendor.
        </p>
      </section>
    );
  }

  return (
    <section
      className="rounded-xl border border-border bg-card p-4 shadow-card"
      aria-label="Assigned technician"
    >
      <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500">
        Assigned technician
      </h2>
      <div className="mt-3 flex items-center gap-3">
        <Avatar name={tech.name} hue={tech.hue} className="h-12 w-12 text-sm" />
        <div className="min-w-0">
          <p className="font-heading text-lg font-bold leading-tight">{tech.name}</p>
          <p className="text-sm text-muted-foreground">{tech.role}</p>
          <Badge variant="info" className="mt-1">
            {tech.shift}
          </Badge>
        </div>
      </div>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex items-center gap-2">
          <dt className="sr-only">Phone</dt>
          <Phone aria-hidden className="h-4 w-4 shrink-0 text-charcoal-400" />
          <dd>
            <a
              href={`tel:${tech.phone.replace(/[^+\d]/g, "")}`}
              className="focus-ring rounded font-semibold text-charcoal-700 underline-offset-2 hover:underline"
            >
              {tech.phone}
            </a>
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">Email</dt>
          <Mail aria-hidden className="h-4 w-4 shrink-0 text-charcoal-400" />
          <dd className="truncate">
            <a
              href={`mailto:${tech.email}`}
              className="focus-ring rounded font-semibold text-charcoal-700 underline-offset-2 hover:underline"
            >
              {tech.email}
            </a>
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">Trades</dt>
          <Timer aria-hidden className="h-4 w-4 shrink-0 text-charcoal-400" />
          <dd className="text-charcoal-600">{tech.specialties.join(" · ")}</dd>
        </div>
      </dl>
    </section>
  );
}

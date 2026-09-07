"use client";

import { Siren, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import { useOpsMetrics } from "@/lib/hooks";
import { CURRENT_USER } from "@/lib/fixtures";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/workorders", label: "Work Orders" },
  { href: "/preventive", label: "Preventive Maintenance" },
  { href: "/vendors", label: "Vendor Directory" },
  { href: "/assets", label: "Asset Registry" },
  { href: "/reports", label: "Reports" },
];

export function TopStatusBar({ onEmergency }: { onEmergency: () => void }) {
  const pathname = usePathname();
  const { active } = useOpsMetrics();

  return (
    <header className="sticky top-0 z-40 bg-charcoal-800 text-charcoal-50 shadow-card">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon.svg" alt="" className="h-9 w-9" />
          <span className="hidden font-heading text-xl font-bold tracking-tight sm:block">
            FacilityFlow
          </span>
        </div>

        <div className="mx-auto hidden items-center gap-2 rounded-full bg-charcoal-700 px-4 py-2 md:flex">
          <span className="text-sm text-charcoal-300">Open work orders</span>
          <span className="rounded bg-safety-orange px-2 py-0.5 text-sm font-bold text-white">
            {active.length}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <OfflineIndicator />

          <button
            type="button"
            onClick={onEmergency}
            className="tap-target focus-ring animate-pulse-ring items-center gap-2 rounded-lg bg-danger px-4 text-sm font-bold uppercase tracking-wide text-white hover:bg-danger/90"
          >
            <Siren aria-hidden className="h-5 w-5" />
            <span className="hidden sm:inline">Emergency</span>
          </button>

          <div className="hidden items-center gap-3 rounded-lg bg-charcoal-700 px-3 py-1.5 lg:flex">
            <span
              aria-hidden
              className="grid h-9 w-9 place-items-center rounded-full bg-charcoal-600 text-xs font-bold"
            >
              {CURRENT_USER.name
                .split(" ")
                .map((p) => p[0])
                .join("")}
            </span>
            <span className="leading-tight">
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <UserRound aria-hidden className="h-3.5 w-3.5 text-charcoal-300" />
                {CURRENT_USER.role}
              </span>
              <span className="block text-xs text-charcoal-300">Shift: {CURRENT_USER.shift}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Mobile section title strip */}
      <div className="border-t border-charcoal-700 px-4 pb-2 pt-1.5 md:hidden">
        <p className="font-heading text-base font-bold uppercase tracking-widest text-charcoal-300">
          {NAV_ITEMS.find((i) => pathname.startsWith(i.href))?.label ?? "Overview"}
        </p>
      </div>
    </header>
  );
}

export function NavCountBadge({ count, active }: { count: number; active: boolean }) {
  return (
    <span
      className={cn(
        "ml-auto rounded-full px-2 py-0.5 text-xs font-bold",
        active ? "bg-safety-orange text-white" : "bg-charcoal-100 text-charcoal-700"
      )}
    >
      {count}
    </span>
  );
}

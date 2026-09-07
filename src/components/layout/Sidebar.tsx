"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from "./nav";
import { useOpsMetrics } from "@/lib/hooks";
import { useOpsStore } from "@/lib/store";
import { CURRENT_USER } from "@/lib/fixtures";
import { cn, initials } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { active, overdue } = useOpsMetrics();
  const inventory = useOpsStore((s) => s.inventory);

  const lowStockCount = inventory.filter((i) => i.quantity <= i.reorderThreshold).length;

  const renderLink = (item: (typeof PRIMARY_NAV_ITEMS)[number], count?: number) => {
    const Icon = item.icon;
    const activeItem = pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={activeItem ? "page" : undefined}
        className={cn(
          "focus-ring flex min-h-12 items-center gap-3 rounded-lg px-3 text-base font-semibold",
          activeItem
            ? "bg-charcoal-600 text-white"
            : "text-charcoal-300 hover:bg-charcoal-700 hover:text-white"
        )}
      >
        <Icon aria-hidden className="h-5 w-5 shrink-0" />
        <span className="truncate">{item.label}</span>
        {count !== undefined && count > 0 && (
          <span
            className={cn(
              "ml-auto rounded-full px-2 py-0.5 text-xs font-bold",
              activeItem ? "bg-safety-orange text-white" : "bg-charcoal-600 text-charcoal-200"
            )}
          >
            {count}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="flex h-dvh w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-charcoal-800 text-charcoal-50">
      <div className="flex items-center gap-3 px-5 pb-5 pt-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon.svg" alt="" className="h-10 w-10" />
        <span className="font-heading text-2xl font-bold tracking-tight">FacilityFlow</span>
      </div>

      <p className="px-5 text-xs font-bold uppercase tracking-widest text-charcoal-400">
        Meridian Tower — Operations
      </p>

      <nav aria-label="Primary" className="mt-4 space-y-1 px-3">
        {PRIMARY_NAV_ITEMS.map((item) =>
          renderLink(item, item.href === "/workorders" ? active.length : undefined)
        )}
      </nav>

      <nav aria-label="Manage" className="mt-6 space-y-1 px-3">
        <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-widest text-charcoal-400">
          Manage
        </p>
        {SECONDARY_NAV_ITEMS.map((item) =>
          renderLink(item, item.href === "/inventory" ? lowStockCount : undefined)
        )}
      </nav>

      <div className="mt-auto">
        {overdue.length > 0 && (
          <div className="mx-3 mb-4 rounded-lg border border-danger/40 bg-danger/15 p-3 text-sm">
            <p className="font-bold text-red-200">{overdue.length} SLA breached</p>
            <p className="mt-0.5 text-red-100/80">Escalate or reassign before end of shift.</p>
          </div>
        )}

        <div className="border-t border-charcoal-700 p-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="grid h-10 w-10 place-items-center rounded-full bg-charcoal-600 text-sm font-bold"
            >
              {initials(CURRENT_USER.name)}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">{CURRENT_USER.name}</p>
              <p className="truncate text-xs text-charcoal-300">{CURRENT_USER.role}</p>
              <p className="truncate text-xs text-charcoal-400">Shift: {CURRENT_USER.shift}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

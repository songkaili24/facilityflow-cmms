"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CalendarCheck, ClipboardList, FileBarChart2, Wrench } from "lucide-react";
import { PRIMARY_NAV_ITEMS } from "./nav";
import { useOpsMetrics } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const NAV_ICONS: Record<string, LucideIcon> = {
  "/workorders": ClipboardList,
  "/preventive": CalendarCheck,
  "/vendors": Wrench,
  "/assets": Building2,
  "/reports": FileBarChart2,
};

const SHORT_LABELS: Record<string, string> = {
  "/workorders": "Work",
  "/preventive": "PM",
  "/vendors": "Vendors",
  "/assets": "Assets",
  "/reports": "Reports",
};

/** Bottom tab bar — mobile only (hidden ≥ md). 64px targets for gloved use. */
export function TabBar() {
  const pathname = usePathname();
  const { active } = useOpsMetrics();

  return (
    <nav
      aria-label="Primary"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-charcoal-700 bg-charcoal-800 text-charcoal-100 md:hidden"
    >
      <ul className="grid grid-cols-5">
        {PRIMARY_NAV_ITEMS.map((item: (typeof PRIMARY_NAV_ITEMS)[number]) => {
          const Icon = NAV_ICONS[item.href] ?? ClipboardList;
          const activeItem = pathname.startsWith(item.href);
          const isWorkOrders = item.href === "/workorders";
          return (
            <li key={item.href} className="grid">
              <Link
                href={item.href}
                aria-current={activeItem ? "page" : undefined}
                className={cn(
                  "focus-ring relative flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold",
                  activeItem ? "text-safety-orange" : "text-charcoal-300"
                )}
              >
                <span className="relative">
                  <Icon aria-hidden className="h-6 w-6" />
                  {isWorkOrders && active.length > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                      {active.length}
                    </span>
                  )}
                </span>
                {SHORT_LABELS[item.href] ?? item.label}
                {activeItem && (
                  <span
                    aria-hidden
                    className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-safety-orange"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

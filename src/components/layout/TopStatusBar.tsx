"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, Siren, UserRound, Wifi, WifiOff } from "lucide-react";
import { usePathname } from "next/navigation";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import { useOpsMetrics } from "@/lib/hooks";
import { useOpsStore } from "@/lib/store";
import { CURRENT_USER } from "@/lib/fixtures";
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from "./nav";
import { cn } from "@/lib/utils";

export function TopStatusBar({ onEmergency }: { onEmergency: () => void }) {
  const pathname = usePathname();
  const { active } = useOpsMetrics();
  const offlineSimulated = useOpsStore((s) => s.offlineSimulated);
  const toggleOfflineSimulated = useOpsStore((s) => s.toggleOfflineSimulated);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [menuOpen]);

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

          {/* Offline simulation toggle (demo affordance for the PWA queue flow) */}
          <button
            type="button"
            onClick={toggleOfflineSimulated}
            aria-pressed={offlineSimulated}
            aria-label={offlineSimulated ? "End offline simulation" : "Simulate offline mode"}
            title={offlineSimulated ? "End offline simulation" : "Simulate offline mode"}
            className={cn(
              "focus-ring tap-target rounded-lg",
              offlineSimulated
                ? "bg-danger text-white"
                : "text-charcoal-300 hover:bg-charcoal-700 hover:text-white"
            )}
          >
            {offlineSimulated ? (
              <WifiOff aria-hidden className="h-5 w-5" />
            ) : (
              <Wifi aria-hidden className="h-5 w-5" />
            )}
          </button>

          {/* Secondary pages menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="Open manage menu"
              className={cn(
                "focus-ring tap-target rounded-lg",
                menuOpen
                  ? "bg-charcoal-600 text-white"
                  : "text-charcoal-300 hover:bg-charcoal-700 hover:text-white"
              )}
            >
              <Menu aria-hidden className="h-5 w-5" />
            </button>
            {menuOpen && (
              <nav
                aria-label="Manage"
                className="absolute right-0 top-[3.25rem] z-50 w-64 animate-fade-in rounded-xl border border-border bg-card p-2 shadow-popped"
              >
                <p className="px-2 pb-1 pt-2 text-[11px] font-bold uppercase tracking-widest text-charcoal-400">
                  Manage
                </p>
                {SECONDARY_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "focus-ring flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-semibold",
                        isActive ? "bg-accent/10 text-accent" : "text-charcoal-700 hover:bg-muted"
                      )}
                    >
                      <Icon aria-hidden className="h-5 w-5 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

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
          {[...PRIMARY_NAV_ITEMS, ...SECONDARY_NAV_ITEMS].find((i) => pathname.startsWith(i.href))
            ?.label ?? "Overview"}
        </p>
      </div>
    </header>
  );
}

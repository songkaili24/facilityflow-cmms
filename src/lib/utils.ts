import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Location } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatMoney(amount: number): string {
  return usd.format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "3h 05m" style durations. Negative inputs are treated as zero. */
export function formatDuration(ms: number): string {
  const minutes = Math.max(0, Math.round(ms / 60_000));
  const days = Math.floor(minutes / (60 * 24));
  const hours = Math.floor((minutes % (60 * 24)) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${String(mins).padStart(2, "0")}m`;
  return `${mins}m`;
}

/** Past dates read as "3h ago", future dates as "in 2d". */
export function formatRelative(iso: string, now: number = Date.now()): string {
  const diffMinutes = Math.round((new Date(iso).getTime() - now) / 60_000);
  const abs = Math.abs(diffMinutes);
  const isPast = diffMinutes < 0;

  if (abs < 1) return "just now";
  if (abs < 60) return isPast ? `${abs}m ago` : `in ${abs}m`;

  const hours = Math.round(abs / 60);
  if (hours < 24) return isPast ? `${hours}h ago` : `in ${hours}h`;

  const days = Math.round(hours / 24);
  return isPast ? `${days}d ago` : `in ${days}d`;
}

/** Compact one-line location, e.g. "Building A · Fl 3 · Zone 2 · Rm 312". */
export function formatLocation(loc: Location): string {
  const floor = loc.floor === "Roof" ? "Roof" : `Fl ${loc.floor}`;
  const parts = [loc.building, floor];
  if (loc.zone) parts.push(loc.zone.replace(/ — .*/, ""));
  if (loc.room) parts.push(`Rm ${loc.room}`);
  return parts.join(" · ");
}

export function warrantyStatus(warrantyEnds: string | null, now: number = Date.now()) {
  if (!warrantyEnds) return "None" as const;
  const daysLeft = Math.round((new Date(warrantyEnds).getTime() - now) / 86_400_000);
  if (daysLeft < 0) return "Expired" as const;
  if (daysLeft <= 90) return "Expiring" as const;
  return "Active" as const;
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...opts,
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Past dates read as "3h ago", future dates as "in 2d". */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const diffMinutes = Math.round((new Date(iso).getTime() - now.getTime()) / 60_000);
  const abs = Math.abs(diffMinutes);
  const isPast = diffMinutes < 0;

  if (abs < 1) return "just now";
  if (abs < 60) return isPast ? `${abs}m ago` : `in ${abs}m`;

  const hours = Math.round(abs / 60);
  if (hours < 24) return isPast ? `${hours}h ago` : `in ${hours}h`;

  const days = Math.round(hours / 24);
  return isPast ? `${days}d ago` : `in ${days}d`;
}

export function isSlaBreached(slaDueAt: string | null, now: Date = new Date()): boolean {
  if (!slaDueAt) return false;
  return new Date(slaDueAt).getTime() < now.getTime();
}

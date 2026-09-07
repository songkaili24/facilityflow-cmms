"use client";

import { ArrowRight, Camera, MessageSquare, UserPlus } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn, formatDateTime, formatRelative } from "@/lib/utils";
import type { TimelineEntry } from "@/lib/types";

const TYPE_ICON: Record<TimelineEntry["type"], typeof MessageSquare> = {
  status: ArrowRight,
  comment: MessageSquare,
  photo: Camera,
  assignment: UserPlus,
};

/** Chronological work order history — status changes, comments, uploads. */
export function ActivityTimeline({ entries }: { entries: TimelineEntry[] }) {
  const ordered = [...entries].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  if (ordered.length === 0) {
    return (
      <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
        No activity recorded yet.
      </p>
    );
  }

  return (
    <ol
      className="relative space-y-4 border-l-2 border-charcoal-200 pl-5"
      aria-label="Activity timeline"
    >
      {ordered.map((entry) => {
        const Icon = TYPE_ICON[entry.type];
        return (
          <li key={entry.id} className="relative">
            <span
              aria-hidden
              className="absolute -left-[1.85rem] top-1 grid h-6 w-6 place-items-center rounded-full bg-charcoal-100 text-charcoal-500"
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Avatar name={entry.actor} className="h-6 w-6 text-[9px]" />
              <span className="text-sm font-bold text-charcoal-800">{entry.actor}</span>
              <time
                dateTime={entry.at}
                suppressHydrationWarning
                className="text-xs text-charcoal-400"
                title={formatDateTime(entry.at)}
              >
                {formatRelative(entry.at)}
              </time>
            </div>
            <p
              className={cn(
                "mt-1 text-sm leading-snug",
                entry.type === "status" ? "font-semibold text-charcoal-700" : "text-charcoal-600"
              )}
            >
              {entry.type === "status"
                ? `Status: ${entry.from ?? "—"} → ${entry.to ?? "—"}`
                : entry.message}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

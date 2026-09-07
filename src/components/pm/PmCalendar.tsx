"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, formatRelative } from "@/lib/utils";
import type { PmTask } from "@/lib/types";

const DAY_MS = 86_400_000;

export interface CalendarDay {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  tasks: PmTask[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isOverdue(task: PmTask, now: number = Date.now()): boolean {
  return new Date(task.nextDue).getTime() < now;
}

export function daysOverdue(task: PmTask, now: number = Date.now()): number {
  return Math.max(0, Math.floor((now - new Date(task.nextDue).getTime()) / DAY_MS));
}

export function buildMonth(anchor: Date, tasks: PmTask[]): CalendarDay[][] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());

  const byDay = new Map<string, PmTask[]>();
  for (const task of tasks) {
    const d = new Date(task.nextDue);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const bucket = byDay.get(key) ?? [];
    bucket.push(task);
    byDay.set(key, bucket);
  }

  const today = new Date();
  const weeks: CalendarDay[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: CalendarDay[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      week.push({
        date,
        inMonth: date.getMonth() === anchor.getMonth(),
        isToday: sameDay(date, today),
        tasks: byDay.get(key) ?? [],
      });
    }
    weeks.push(week);
  }
  return weeks;
}

interface PmCalendarProps {
  tasks: PmTask[];
  onSelectTask: (task: PmTask) => void;
}

/** Month grid of scheduled PM; overdue tasks render in red. */
export function PmCalendar({ tasks, onSelectTask }: PmCalendarProps) {
  const [anchor, setAnchor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const weeks = useMemo(() => buildMonth(anchor, tasks), [anchor, tasks]);
  const monthLabel = anchor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <section aria-label="PM calendar" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => setAnchor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft aria-hidden className="h-5 w-5" />
          </Button>
          <h2 className="min-w-48 text-center font-heading text-lg font-bold">{monthLabel}</h2>
          <Button
            variant="outline"
            size="md"
            onClick={() => setAnchor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
            aria-label="Next month"
          >
            <ChevronRight aria-hidden className="h-5 w-5" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="md"
          onClick={() => {
            const now = new Date();
            setAnchor(new Date(now.getFullYear(), now.getMonth(), 1));
          }}
        >
          Today
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <div className="min-w-[52rem]">
          <div className="grid grid-cols-7 border-b border-border bg-muted/60">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="px-3 py-2 text-center text-xs font-bold uppercase tracking-widest text-charcoal-500"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {weeks.flat().map((day, i) => (
              <div
                key={i}
                aria-label={`${day.date.toDateString()} — ${day.tasks.length} scheduled`}
                className={cn(
                  "min-h-24 border-b border-r border-border p-2",
                  !day.inMonth && "bg-muted/40",
                  day.isToday && "bg-accent/5 ring-1 ring-inset ring-accent/40"
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-full text-sm font-bold",
                    day.isToday
                      ? "bg-accent text-white"
                      : day.inMonth
                        ? "text-charcoal-700"
                        : "text-charcoal-300"
                  )}
                >
                  {day.date.getDate()}
                </span>
                <div className="mt-1 space-y-1">
                  {day.tasks.slice(0, 2).map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => onSelectTask(task)}
                      title={`${task.number} — ${task.title}`}
                      className={cn(
                        "focus-ring w-full truncate rounded px-1.5 py-1 text-left text-[11px] font-semibold",
                        isOverdue(task)
                          ? "bg-danger text-white hover:bg-danger/90"
                          : "bg-charcoal-800 text-charcoal-50 hover:bg-charcoal-700"
                      )}
                    >
                      {task.assetId.replace("ast-", "").toUpperCase()} · {task.title}
                    </button>
                  ))}
                  {day.tasks.length > 2 && (
                    <p className="px-1 text-[10px] font-bold text-charcoal-400">
                      +{day.tasks.length - 2} more
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-charcoal-400">
        Tip: tasks due before today render in red — clear overdue PM first. Next due shown relative:{" "}
        {""}
        <span suppressHydrationWarning>{formatRelative(new Date().toISOString())}</span>
      </p>
    </section>
  );
}

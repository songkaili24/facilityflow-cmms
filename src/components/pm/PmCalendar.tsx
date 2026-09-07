"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { usePmTasks } from "@/lib/hooks";
import { useOpsStore } from "@/lib/store";
import { cn, formatDate, formatRelative } from "@/lib/utils";
import type { PreventiveMaintenanceTask } from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;

interface CalendarDay {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  tasks: PreventiveMaintenanceTask[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonth(anchor: Date, tasks: PreventiveMaintenanceTask[]): CalendarDay[][] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay()); // back to Sunday

  const byDay = new Map<string, PreventiveMaintenanceTask[]>();
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

export function PmCalendar() {
  const { pmTasks } = usePmTasks();
  const markSynced = useOpsStore((s) => s.markSynced);
  const { toast } = useToast();
  const [anchor, setAnchor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selected, setSelected] = useState<PreventiveMaintenanceTask | null>(null);

  const weeks = useMemo(() => buildMonth(anchor, pmTasks), [anchor, pmTasks]);

  const upcoming = useMemo(
    () =>
      [...pmTasks]
        .filter((t) => new Date(t.nextDue).getTime() > Date.now() - 12 * 60 * 60 * 1000)
        .sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime())
        .slice(0, 6),
    [pmTasks]
  );

  const shiftMonth = (delta: number) => {
    setAnchor((cur) => new Date(cur.getFullYear(), cur.getMonth() + delta, 1));
    setSelected(null);
  };

  const dispatchPm = (task: PreventiveMaintenanceTask) => {
    // Simulated dispatch — replace with POST /api/pm/:id/dispatch.
    markSynced(task.id);
    toast({
      title: `PM ${task.number} dispatched`,
      description: `${task.title} assigned to ${task.assignedVendor ?? "in-house crew"}.`,
      variant: "success",
    });
    setSelected(null);
  };

  const monthLabel = anchor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
          >
            <ChevronLeft aria-hidden className="h-5 w-5" />
          </Button>
          <h2 className="min-w-56 text-center font-heading text-xl font-bold">{monthLabel}</h2>
          <Button variant="outline" size="md" onClick={() => shiftMonth(1)} aria-label="Next month">
            <ChevronRight aria-hidden className="h-5 w-5" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={() => {
            const now = new Date();
            setAnchor(new Date(now.getFullYear(), now.getMonth(), 1));
          }}
        >
          Today
        </Button>
      </div>

      {/* Desktop calendar grid */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <div className="min-w-[54rem]">
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
                  day.isToday && "bg-accent/5"
                )}
              >
                <div className="flex items-center justify-between">
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
                  {day.tasks.length > 0 && (
                    <span className="text-[10px] font-bold uppercase text-charcoal-400">
                      {day.tasks.length} PM
                    </span>
                  )}
                </div>
                <div className="mt-1 space-y-1">
                  {day.tasks.slice(0, 2).map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setSelected(task)}
                      className="focus-ring w-full truncate rounded bg-charcoal-800 px-1.5 py-1 text-left text-[11px] font-semibold text-charcoal-50 hover:bg-charcoal-700"
                      title={`${task.number} — ${task.title}`}
                    >
                      {task.assetTag} · {task.title}
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

      {/* Mobile: upcoming schedule list (hidden ≥ md) */}
      <section className="md:hidden" aria-label="Upcoming preventive maintenance">
        <h3 className="mb-2 font-heading text-sm font-bold uppercase tracking-widest text-charcoal-700">
          Upcoming schedule
        </h3>
        <ul className="space-y-3">
          {upcoming.map((task) => (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => setSelected(task)}
                className="focus-ring w-full rounded-xl border border-border bg-card p-4 text-left shadow-card"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="info">{task.frequency}</Badge>
                  <span className="ml-auto font-mono text-xs font-bold text-charcoal-400">
                    {task.number}
                  </span>
                </div>
                <h4 className="mt-2 text-base font-bold leading-snug">{task.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {task.assetName} · {formatDate(task.nextDue, { weekday: "short" })}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Task dispatch dialog */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.number} details`}
          className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-charcoal-900/70 sm:items-center sm:p-6"
        >
          <div className="w-full max-w-md animate-slide-up rounded-t-2xl bg-card p-6 shadow-popped sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-bold text-charcoal-400">{selected.number}</p>
                <h3 className="mt-1 font-heading text-xl font-bold">{selected.title}</h3>
              </div>
              <Badge variant="info">{selected.frequency}</Badge>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-charcoal-500">Asset</dt>
                <dd className="text-right font-semibold">
                  {selected.assetName} ({selected.assetTag})
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-charcoal-500">Next due</dt>
                <dd className="flex items-center gap-1.5 text-right font-semibold">
                  <Clock aria-hidden className="h-4 w-4 text-charcoal-400" />
                  {formatDate(selected.nextDue, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-charcoal-500">Vendor</dt>
                <dd className="text-right font-semibold">
                  {selected.assignedVendor ?? "In-house crew"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-charcoal-500">Est. duration</dt>
                <dd className="text-right font-semibold">{selected.estimatedHours}h</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-charcoal-500">Last completed</dt>
                <dd className="text-right font-semibold">
                  {selected.lastCompleted ? formatRelative(selected.lastCompleted) : "No record"}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" size="lg" onClick={() => setSelected(null)}>
                Close
              </Button>
              <Button variant="primary" size="lg" onClick={() => dispatchPm(selected)}>
                Dispatch PM Work Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

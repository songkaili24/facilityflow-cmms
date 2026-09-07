"use client";

import { useMemo, useState } from "react";
import { CalendarDays, List, Plus, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { selectClass } from "@/components/ui/formControls";
import { useToast } from "@/components/ui/Toast";
import { useOpsStore } from "@/lib/store";
import {
  useAssetLookup,
  useAssets,
  usePmTasks,
  useTechnicianLookup,
  useVendorLookup,
} from "@/lib/hooks";
import { cn, formatDuration, formatRelative } from "@/lib/utils";
import type { PmTask, PmFrequency, WorkOrderCategory } from "@/lib/types";
import { isOverdue, daysOverdue, PmCalendar } from "./PmCalendar";
import { SchedulePmModal } from "./SchedulePmModal";

const DAY_MS = 86_400_000;

type PmView = "calendar" | "list";

/** /preventive — PM console: calendar, upcoming list, history log, scheduling. */
export function PreventiveView() {
  const { pmTasks } = usePmTasks();
  const { assetById } = useAssetLookup();
  const { technicianName } = useTechnicianLookup();
  const { vendorName } = useVendorLookup();
  const { assets } = useAssets();
  const createWorkOrder = useOpsStore((s) => s.createWorkOrder);
  const { toast } = useToast();

  const [view, setView] = useState<PmView>("calendar");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selected, setSelected] = useState<PmTask | null>(null);

  const assetCategories = useMemo(
    () => [...new Set(assets.map((a) => a.category))].sort(),
    [assets]
  );
  const frequencies = useMemo(
    () => [...new Set(pmTasks.map((t) => t.frequency))].sort(),
    [pmTasks]
  );

  const filtered = pmTasks.filter((task) => {
    if (category) {
      const asset = assetById(task.assetId);
      if (!asset || asset.category !== category) return false;
    }
    if (frequency && task.frequency !== frequency) return false;
    return true;
  });

  const overdue = filtered.filter((t) => isOverdue(t));
  const upcoming = filtered
    .filter((t) => !isOverdue(t))
    .sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime());

  const assigneeOf = (task: PmTask) =>
    task.assignedTechId
      ? technicianName(task.assignedTechId)
      : task.vendorId
        ? (vendorName(task.vendorId) ?? "In-house crew")
        : "In-house crew";

  const dispatchPm = (task: PmTask) => {
    const asset = assetById(task.assetId);
    if (!asset) return;
    const wo = createWorkOrder({
      title: `[PM ${task.number}] ${task.title}`,
      category: asset.category,
      priority: "medium",
      location: asset.location,
      description: `Preventive maintenance dispatched from PM schedule ${task.number} (${task.frequency.toLowerCase()}, est. ${task.estHours}h). ${task.taskType} on ${asset.tag} — ${asset.name}.`,
      assigneeId: task.assignedTechId,
      dueAt: new Date(Date.now() + 3 * DAY_MS).toISOString(),
      photoCount: 0,
    });
    toast({
      title: `${wo.number} generated`,
      description: `${task.number} dispatched — ${assigneeOf(task)} notified. Est. ${formatDuration(task.estHours * 3_600_000)} on task.`,
      variant: "success",
    });
    setSelected(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Preventive Maintenance</h1>
          <p className="mt-1 text-sm text-muted-foreground" suppressHydrationWarning>
            {pmTasks.length} recurring tasks · {overdue.length} overdue · CMMS auto-scheduling
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setScheduleOpen(true)}>
          <Plus aria-hidden className="mr-2 h-5 w-5" />
          Schedule PM
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-charcoal-500">
            Asset category
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={selectClass}
          >
            <option value="">All categories</option>
            {assetCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-charcoal-500">
            Frequency
          </span>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as PmFrequency | "")}
            className={selectClass}
          >
            <option value="">All frequencies</option>
            {frequencies.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <div
            role="group"
            aria-label="PM view mode"
            className="inline-flex rounded-lg border border-input bg-card p-1"
          >
            <button
              type="button"
              onClick={() => setView("calendar")}
              aria-pressed={view === "calendar"}
              className={cn(
                "focus-ring inline-flex min-h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold",
                view === "calendar"
                  ? "bg-charcoal-800 text-white"
                  : "text-charcoal-600 hover:bg-muted"
              )}
            >
              <CalendarDays aria-hidden className="h-4 w-4" />
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              className={cn(
                "focus-ring inline-flex min-h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold",
                view === "list" ? "bg-charcoal-800 text-white" : "text-charcoal-600 hover:bg-muted"
              )}
            >
              <List aria-hidden className="h-4 w-4" />
              List
            </button>
          </div>
        </div>
      </div>

      {view === "calendar" ? (
        <PmCalendar tasks={filtered} onSelectTask={setSelected} />
      ) : (
        <section aria-label="Upcoming PM tasks" className="space-y-3">
          {overdue.length > 0 && (
            <>
              <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-danger">
                Overdue — schedule immediately
              </h2>
              <ul className="space-y-2">
                {overdue.map((task) => (
                  <PmRow
                    key={task.id}
                    task={task}
                    assignee={assigneeOf(task)}
                    onSelect={setSelected}
                  />
                ))}
              </ul>
            </>
          )}
          <h2 className="pt-2 font-heading text-sm font-bold uppercase tracking-widest text-charcoal-500">
            Upcoming
          </h2>
          <ul className="space-y-2">
            {upcoming.map((task) => (
              <PmRow key={task.id} task={task} assignee={assigneeOf(task)} onSelect={setSelected} />
            ))}
          </ul>
          {filtered.length === 0 && (
            <p className="rounded-xl border border-dashed border-charcoal-200 bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
              No PM tasks match these filters.
            </p>
          )}
        </section>
      )}

      <PmHistoryLog tasks={pmTasks} />

      <SchedulePmModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} />
      <PmDispatchDialog
        task={selected}
        assignee={selected ? assigneeOf(selected) : ""}
        onClose={() => setSelected(null)}
        onDispatch={dispatchPm}
      />
    </div>
  );
}

function useAssetList() {
  return useAssets();
}

function PmRow({
  task,
  assignee,
  onSelect,
}: {
  task: PmTask;
  assignee: string;
  onSelect: (t: PmTask) => void;
}) {
  const { assetById } = useAssetLookup();
  const asset = assetById(task.assetId);
  const overdue = isOverdue(task);
  const days = daysOverdue(task);

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(task)}
        className={cn(
          "focus-ring w-full rounded-xl border bg-card p-4 text-left shadow-card hover:border-charcoal-300",
          overdue ? "border-l-4 border-l-danger" : "border-border"
        )}
        aria-label={`${task.number}: ${task.title}. ${overdue ? `${days} days overdue.` : ""} Next due ${new Date(task.nextDue).toLocaleDateString()}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold text-charcoal-500">{task.number}</span>
          <Badge variant={overdue ? "danger" : "info"}>{task.frequency}</Badge>
          {overdue && (
            <Badge variant="danger" className="ml-auto">
              {days} {days === 1 ? "day" : "days"} overdue
            </Badge>
          )}
        </div>
        <h3 className="mt-1.5 text-base font-bold leading-snug">{task.title}</h3>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground sm:grid-cols-4">
          <div>
            <dt className="sr-only">Asset</dt>
            <dd className="truncate font-medium text-charcoal-700">
              {asset ? `${asset.tag} — ${asset.name}` : task.taskType}
            </dd>
          </div>
          <div>
            <dt className="sr-only">Task type</dt>
            <dd>{task.taskType}</dd>
          </div>
          <div>
            <dt className="sr-only">Next due</dt>
            <dd suppressHydrationWarning className={overdue ? "font-semibold text-danger" : ""}>
              {formatRelative(task.nextDue)}
            </dd>
          </div>
          <div>
            <dt className="sr-only">Assigned to</dt>
            <dd className="truncate">{assignee}</dd>
          </div>
        </dl>
      </button>
    </li>
  );
}

function PmDispatchDialog({
  task,
  assignee,
  onClose,
  onDispatch,
}: {
  task: PmTask | null;
  assignee: string;
  onClose: () => void;
  onDispatch: (t: PmTask) => void;
}) {
  if (!task) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${task.number} details`}
      className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-charcoal-900/70 sm:items-center sm:p-6"
    >
      <div className="w-full max-w-md animate-slide-up rounded-t-2xl bg-card p-6 shadow-popped sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-bold text-charcoal-400">{task.number}</p>
            <h2 className="mt-1 font-heading text-xl font-bold">{task.title}</h2>
          </div>
          <Badge variant={isOverdue(task) ? "danger" : "info"}>{task.frequency}</Badge>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-charcoal-500">Task type</dt>
            <dd className="text-right font-semibold">{task.taskType}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-charcoal-500">Next due</dt>
            <dd className="text-right font-semibold" suppressHydrationWarning>
              {formatRelative(task.nextDue)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-charcoal-500">Assigned to</dt>
            <dd className="text-right font-semibold">{assignee}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-charcoal-500">Est. duration</dt>
            <dd className="text-right font-semibold">
              {formatDuration(task.estHours * 3_600_000)}
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" size="lg" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="lg" onClick={() => onDispatch(task)}>
            <Wrench aria-hidden className="mr-2 h-5 w-5" />
            Generate Work Order
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Completion records across all recurring tasks, newest first. */
export function PmHistoryLog({ tasks }: { tasks: PmTask[] }) {
  const records = useMemo(
    () =>
      tasks
        .flatMap((task) =>
          task.history.map((h) => ({ ...h, taskNumber: task.number, taskTitle: task.title }))
        )
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        .slice(0, 8),
    [tasks]
  );

  return (
    <section
      className="rounded-xl border border-border bg-card p-5 shadow-card"
      aria-label="PM history log"
    >
      <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500">
        PM history log
      </h2>
      {records.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No completion records yet.</p>
      ) : (
        <ol className="mt-3 divide-y divide-border">
          {records.map((r) => (
            <li
              key={`${r.taskNumber}-${r.completedAt}`}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5"
            >
              <span className="font-mono text-xs font-bold text-charcoal-500">{r.taskNumber}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-charcoal-800">
                {r.taskTitle}
              </span>
              <span className="text-xs text-charcoal-500">{r.completedBy}</span>
              <time
                dateTime={r.completedAt}
                suppressHydrationWarning
                className="text-xs text-charcoal-400"
              >
                {formatRelative(r.completedAt)}
              </time>
              <span className="w-full truncate text-xs text-charcoal-500">{r.notes}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  fieldLabelClass,
  inputClass,
  selectClass,
  textareaClass,
  errorTextClass,
} from "@/components/ui/formControls";
import { useTechnicians } from "@/lib/hooks";
import { useOpsStore } from "@/lib/store";
import { SLA_HOURS, slaDueFrom, slaLabel } from "@/lib/sla";
import {
  BUILDINGS,
  FLOORS_BY_BUILDING,
  WORK_ORDER_CATEGORIES,
  ZONES,
  type Location,
  type WorkOrderCategory,
  type WorkOrderPriority,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const TITLE_MIN = 8;
const TITLE_MAX = 80;
const DESC_MIN = 30;

/** New work order intake form — modal over the dispatch board. */
export function NewWorkOrderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const { technicians } = useTechnicians();
  const createWorkOrder = useOpsStore((s) => s.createWorkOrder);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<WorkOrderCategory>("HVAC");
  const [priority, setPriority] = useState<WorkOrderPriority>("medium");
  const [building, setBuilding] = useState<string>("");
  const [floor, setFloor] = useState<string>("");
  const [zone, setZone] = useState<string>("");
  const [room, setRoom] = useState<string>("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [dueAt, setDueAt] = useState<string>(() => toDatetimeLocal(slaDueFrom("medium")));
  const [dueTouched, setDueTouched] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Reset the form each time the modal opens.
  useEffect(() => {
    if (!open) return;
    setTitle("");
    setCategory("HVAC");
    setPriority("medium");
    setBuilding("");
    setFloor("");
    setZone("");
    setRoom("");
    setDescription("");
    setAssigneeId("");
    setDueAt(toDatetimeLocal(slaDueFrom("medium")));
    setDueTouched(false);
    setPhotoCount(0);
  }, [open]);

  // SLA auto-calculation: priority drives the due date until manually edited.
  useEffect(() => {
    if (!dueTouched) setDueAt(toDatetimeLocal(slaDueFrom(priority)));
  }, [priority, dueTouched]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const floors = building ? (FLOORS_BY_BUILDING[building] ?? []) : [];
  const location: Location | null =
    building && floor
      ? { building, floor, zone: zone || undefined, room: room || undefined }
      : null;

  const titleValid = title.trim().length >= TITLE_MIN && title.length <= TITLE_MAX;
  const descValid = description.trim().length >= DESC_MIN;
  const locationValid = location !== null;
  const dueValid = dueAt !== "" && !Number.isNaN(new Date(dueAt).getTime());
  const canSubmit = titleValid && descValid && locationValid && dueValid;

  const autoAssignHint = useMemo(() => {
    const match = technicians.find((t) => t.specialties.includes(category));
    return match
      ? `Auto-assign routes to ${match.name} (${category} trade)`
      : "Auto-assign routes to the duty engineer";
  }, [technicians, category]);

  if (!open) return null;

  const submit = () => {
    if (!canSubmit || !location) return;
    const assignee = assigneeId
      ? assigneeId
      : ((technicians.find((t) => t.specialties.includes(category)) ?? technicians[0])?.id ?? null);
    const wo = createWorkOrder({
      title: title.trim(),
      category,
      priority,
      location,
      description: description.trim(),
      assigneeId: assignee,
      dueAt: new Date(dueAt).toISOString(),
      photoCount,
    });
    toast({
      title: `${wo.number} created`,
      description: assignee
        ? `Routed to the ${category} queue. SLA clock started — ${slaLabel(priority)}.`
        : `Held in the New queue. SLA clock started — ${slaLabel(priority)}.`,
      variant: "success",
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-wo-title"
      className="fixed inset-0 z-50 animate-fade-in overflow-y-auto bg-charcoal-900/70"
    >
      <div className="mx-auto my-6 w-[calc(100%-2rem)] max-w-2xl animate-slide-up rounded-2xl bg-card p-6 shadow-popped">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="new-wo-title" className="font-heading text-2xl font-bold">
              New Work Order
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Intake form — SLA deadline is calculated automatically from priority.
            </p>
          </div>
          <Button variant="ghost" size="md" onClick={onClose} aria-label="Close form">
            <X aria-hidden className="h-5 w-5" />
          </Button>
        </div>

        <form
          className="mt-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <label className="block">
            <span className={fieldLabelClass}>
              Title{" "}
              <span className="text-charcoal-400">
                ({title.length}/{TITLE_MAX} · min {TITLE_MIN})
              </span>
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
              placeholder="e.g., AHU-3 bearing replacement"
              className={cn(inputClass, title && !titleValid && "border-danger")}
              autoFocus
              required
            />
            {title && !titleValid && (
              <span className={errorTextClass}>
                Title must be {TITLE_MIN}–{TITLE_MAX} characters.
              </span>
            )}
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className={fieldLabelClass}>Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as WorkOrderCategory)}
                className={selectClass}
              >
                {WORK_ORDER_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={fieldLabelClass}>Assign to</span>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className={selectClass}
              >
                <option value="">Auto-assign (by category)</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.role}
                  </option>
                ))}
              </select>
              {!assigneeId && (
                <span className="mt-1 block text-xs text-charcoal-500">{autoAssignHint}</span>
              )}
            </label>
          </div>

          <fieldset>
            <legend className={fieldLabelClass}>Priority</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(Object.keys(SLA_HOURS) as WorkOrderPriority[]).map((p) => {
                const selected = priority === p;
                const bar =
                  p === "critical"
                    ? "bg-danger"
                    : p === "high"
                      ? "bg-accent"
                      : p === "medium"
                        ? "bg-warning"
                        : "bg-charcoal-300";
                return (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setPriority(p)}
                    className={cn(
                      "focus-ring relative overflow-hidden rounded-lg border-2 p-3 text-left",
                      selected
                        ? "border-charcoal-800 bg-muted"
                        : "border-input bg-card hover:border-charcoal-300"
                    )}
                  >
                    <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1.5", bar)} />
                    <span className="block pl-2 text-sm font-bold capitalize">{p}</span>
                    <span className="block pl-2 text-xs text-charcoal-500">{slaLabel(p)}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-border p-4">
            <legend className={cn(fieldLabelClass, "px-1")}>Location</legend>
            <div className="grid gap-3 sm:grid-cols-4">
              <label className="block">
                <span className={fieldLabelClass}>Building</span>
                <select
                  value={building}
                  onChange={(e) => {
                    setBuilding(e.target.value);
                    setFloor("");
                    setZone("");
                    setRoom("");
                  }}
                  className={selectClass}
                  required
                >
                  <option value="">Select…</option>
                  {BUILDINGS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={fieldLabelClass}>Floor</span>
                <select
                  value={floor}
                  onChange={(e) => {
                    setFloor(e.target.value);
                    setZone("");
                    setRoom("");
                  }}
                  className={selectClass}
                  disabled={!building}
                  required
                >
                  <option value="">Select…</option>
                  {floors.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={fieldLabelClass}>Zone</span>
                <select
                  value={zone}
                  onChange={(e) => {
                    setZone(e.target.value);
                    setRoom("");
                  }}
                  className={selectClass}
                  disabled={!floor}
                >
                  <option value="">Select…</option>
                  {ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={fieldLabelClass}>Room</span>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g., 312"
                  className={inputClass}
                  disabled={!floor}
                />
              </label>
            </div>
          </fieldset>

          <label className="block">
            <span className={fieldLabelClass}>
              Description{" "}
              <span className="text-charcoal-400">
                (min {DESC_MIN} chars · {description.trim().length})
              </span>
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Reported issue, access notes, LOTO requirements, tenant impact…"
              className={cn(textareaClass, description && !descValid && "border-danger")}
              required
            />
            {description && !descValid && (
              <span className={errorTextClass}>
                Describe the issue in at least {DESC_MIN} characters.
              </span>
            )}
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <span className={fieldLabelClass}>Photos</span>
              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => fileRef.current?.click()}
              >
                <Camera aria-hidden className="mr-2 h-5 w-5 text-accent" />
                {photoCount > 0
                  ? `${photoCount} photo${photoCount > 1 ? "s" : ""} attached`
                  : "Attach photos"}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                  setPhotoCount(e.target.files?.length ?? 0);
                  e.target.value = "";
                }}
              />
              <p className="mt-1 text-xs text-charcoal-500">
                Draw-on-photo annotation ships with the field tablet build.
              </p>
            </div>

            <label className="block">
              <span className={fieldLabelClass}>
                Due date {dueTouched ? "(manual)" : "(SLA auto)"}
              </span>
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => {
                  setDueAt(e.target.value);
                  setDueTouched(true);
                }}
                className={inputClass}
                required
              />
              <span className="mt-1 block text-xs text-charcoal-500">
                {priority} priority → {slaLabel(priority)}
              </span>
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button variant="outline" size="lg" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="lg" type="submit" disabled={!canSubmit}>
              Create Work Order
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

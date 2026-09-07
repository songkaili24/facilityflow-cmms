"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { fieldLabelClass, inputClass, selectClass } from "@/components/ui/formControls";
import { useAssets, useTechnicians, useVendors } from "@/lib/hooks";
import { useOpsStore } from "@/lib/store";
import { PM_FREQUENCIES, type PmFrequency } from "@/lib/types";
import { cn } from "@/lib/utils";

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

const FREQUENCY_MONTHS: Record<PmFrequency, number> = {
  Daily: 0,
  Weekly: 0,
  Monthly: 1,
  Quarterly: 3,
  "Semi-Annual": 6,
  Annual: 12,
};

/** Recurring PM scheduling form — modal over the PM console. */
export function SchedulePmModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const { assets } = useAssets();
  const { technicians } = useTechnicians();
  const { vendors } = useVendors();
  const schedulePm = useOpsStore((s) => s.schedulePm);

  const [title, setTitle] = useState("");
  const [taskType, setTaskType] = useState("");
  const [frequency, setFrequency] = useState<PmFrequency>("Monthly");
  const [assetId, setAssetId] = useState("");
  const [assignedTechId, setAssignedTechId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [nextDue, setNextDue] = useState(() => toDatetimeLocal(new Date().toISOString()));
  const [estHours, setEstHours] = useState("2");

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setTaskType("");
    setFrequency("Monthly");
    setAssetId("");
    setAssignedTechId("");
    setVendorId("");
    const inAMonth = new Date();
    inAMonth.setMonth(inAMonth.getMonth() + 1);
    setNextDue(toDatetimeLocal(inAMonth.toISOString()));
    setEstHours("2");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canSubmit = title.trim().length >= 6 && assetId !== "" && nextDue !== "";

  const submit = () => {
    if (!canSubmit) return;
    const task = schedulePm({
      title: title.trim(),
      taskType: taskType.trim() || frequency + " PM",
      frequency,
      assetId,
      assignedTechId: assignedTechId || null,
      nextDue: new Date(nextDue).toISOString(),
      estHours: Number(estHours) || 1,
    });
    // Vendor selection is recorded on the PM record when the backend lands.
    void vendorId;
    toast({
      title: `${task.number} scheduled`,
      description: `${title.trim()} — ${frequency.toLowerCase()} cadence. First due ${new Date(nextDue).toLocaleDateString("en-US", { month: "short", day: "numeric" })}.`,
      variant: "success",
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-pm-title"
      className="fixed inset-0 z-50 animate-fade-in overflow-y-auto bg-charcoal-900/70"
    >
      <div className="mx-auto my-6 w-[calc(100%-2rem)] max-w-xl animate-slide-up rounded-2xl bg-card p-6 shadow-popped">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="schedule-pm-title" className="font-heading text-2xl font-bold">
              Schedule PM Task
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Recurring task on a building asset — completion records are logged here.
            </p>
          </div>
          <Button variant="ghost" size="md" onClick={onClose} aria-label="Close form">
            <X aria-hidden className="h-5 w-5" />
          </Button>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <label className="block">
            <span className={fieldLabelClass}>Task title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Cooling tower water treatment check"
              className={cn(inputClass)}
              autoFocus
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={fieldLabelClass}>Task type</span>
              <input
                type="text"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                placeholder="e.g., Filter change, Load test"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={fieldLabelClass}>Frequency</span>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as PmFrequency)}
                className={selectClass}
              >
                {PM_FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={fieldLabelClass}>Asset</span>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className={selectClass}
                required
              >
                <option value="">Select asset…</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.tag} — {a.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={fieldLabelClass}>Assign to</span>
              <select
                value={assignedTechId}
                onChange={(e) => setAssignedTechId(e.target.value)}
                className={selectClass}
              >
                <option value="">In-house — duty engineer</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.role}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className={fieldLabelClass}>Vendor (optional)</span>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className={selectClass}
            >
              <option value="">In-house crew</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} — {v.specialty}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={fieldLabelClass}>First due</span>
              <input
                type="datetime-local"
                value={nextDue}
                onChange={(e) => setNextDue(e.target.value)}
                className={inputClass}
                required
              />
              <span className="mt-1 block text-xs text-charcoal-500">
                Recurs every{" "}
                {FREQUENCY_MONTHS[frequency] > 0
                  ? `${FREQUENCY_MONTHS[frequency]} month(s)`
                  : frequency.toLowerCase()}
              </span>
            </label>
            <label className="block">
              <span className={fieldLabelClass}>Estimated hours</span>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={estHours}
                onChange={(e) => setEstHours(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button variant="outline" size="lg" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="lg" type="submit" disabled={!canSubmit}>
              Schedule Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { fieldLabelClass, inputClass, errorTextClass } from "@/components/ui/formControls";
import { useOpsStore } from "@/lib/store";
import { formatSlaHours } from "@/lib/sla";
import { PRIORITY_META } from "@/lib/statuses";
import {
  DEFAULT_SLA_POLICY,
  type SlaPolicy,
  type SlaTargets,
  type WorkOrderPriority,
} from "@/lib/types";

const PRIORITIES = Object.keys(PRIORITY_META) as [
  WorkOrderPriority,
  WorkOrderPriority,
  WorkOrderPriority,
  WorkOrderPriority,
];

const FIELDS: { key: keyof SlaTargets; label: string; hint: string }[] = [
  { key: "responseHours", label: "Response", hint: "Acknowledge & assign" },
  { key: "arrivalHours", label: "On-site", hint: "Arrive at location" },
  { key: "resolutionHours", label: "Resolution", hint: "Work completed" },
];

/** /sla-config — admin editor for response/on-site/resolution targets. */
export function SlaConfigView() {
  const slaPolicy = useOpsStore((s) => s.slaPolicy);
  const updateSlaPolicy = useOpsStore((s) => s.updateSlaPolicy);
  const { toast } = useToast();

  const [draft, setDraft] = useState<SlaPolicy>(slaPolicy ?? DEFAULT_SLA_POLICY);
  const [errors, setErrors] = useState<
    Partial<Record<`${WorkOrderPriority}.${keyof SlaTargets}`, string>>
  >({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(slaPolicy ?? DEFAULT_SLA_POLICY);
    setDirty(slaPolicy !== null);
  }, [slaPolicy]);

  const validate = (candidate: SlaPolicy) => {
    const next: typeof errors = {};
    for (const priority of PRIORITIES) {
      for (const { key } of FIELDS) {
        const value = candidate[priority][key];
        if (!Number.isFinite(value) || value <= 0) {
          next[`${priority}.${key}`] = "Must be greater than 0";
        }
      }
      const t = candidate[priority];
      if (!(t.responseHours <= t.arrivalHours && t.arrivalHours <= t.resolutionHours)) {
        next[`${priority}.responseHours`] =
          next[`${priority}.responseHours`] ?? "Response ≤ on-site ≤ resolution must hold";
      }
    }
    // Wider windows for lower priorities.
    for (let i = 0; i < PRIORITIES.length - 1; i++) {
      const a = PRIORITIES[i]!;
      const b = PRIORITIES[i + 1]!;
      if (candidate[b].resolutionHours < candidate[a].resolutionHours) {
        next[`${b}.resolutionHours`] = "Lower priorities need ≥ the tighter tier above";
      }
    }
    return next;
  };

  const setField = (priority: WorkOrderPriority, key: keyof SlaTargets, raw: string) => {
    const value = raw === "" ? Number.NaN : Math.round(Number(raw) * 100) / 100;
    const nextDraft: SlaPolicy = {
      ...draft,
      [priority]: { ...draft[priority], [key]: value },
    };
    setDraft(nextDraft);
    setDirty(true);
    setErrors(validate(nextDraft));
  };

  const canSave = Object.keys(errors).length === 0 && dirty;

  const save = () => {
    if (!canSave) return;
    updateSlaPolicy(draft);
    setDirty(false);
    toast({
      title: "SLA policy updated",
      description: "New work orders now use these response, on-site, and resolution targets.",
      variant: "success",
    });
  };

  const reset = () => {
    setDraft(DEFAULT_SLA_POLICY);
    setErrors({});
    setDirty(slaPolicy !== null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">SLA Configuration</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Response, on-site, and resolution targets by priority — applied to new work orders at
            intake
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="md" onClick={reset}>
            <RotateCcw aria-hidden className="mr-2 h-4 w-4" />
            Reset defaults
          </Button>
          <Button variant="primary" size="md" onClick={save} disabled={!canSave}>
            <Save aria-hidden className="mr-2 h-4 w-4" />
            Save policy
          </Button>
        </div>
      </div>

      <p
        role="status"
        className={
          dirty ? "text-sm font-semibold text-warning-foreground" : "text-sm text-muted-foreground"
        }
        suppressHydrationWarning
      >
        {dirty
          ? "Unsaved changes — the active policy is still the last saved set."
          : "Showing the active policy. Edit any field and save to apply."}
      </p>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <caption className="sr-only">SLA targets by priority level</caption>
          <thead>
            <tr className="border-b border-border bg-muted/60 text-xs font-bold uppercase tracking-widest text-charcoal-500">
              <th scope="col" className="px-4 py-3">
                Priority
              </th>
              {FIELDS.map((f) => (
                <th key={f.key} scope="col" className="px-4 py-3">
                  {f.label}
                  <span className="block font-medium normal-case tracking-normal text-charcoal-400">
                    {f.hint}
                  </span>
                </th>
              ))}
              <th scope="col" className="px-4 py-3">
                Resolution window
              </th>
            </tr>
          </thead>
          <tbody>
            {PRIORITIES.map((priority) => {
              const meta = PRIORITY_META[priority];
              return (
                <tr key={priority} className="border-b border-border last:border-b-0">
                  <th scope="row" className="px-4 py-4">
                    <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
                  </th>
                  {FIELDS.map(({ key, label }) => {
                    const errorKey = `${priority}.${key}` as const;
                    const err = errors[errorKey];
                    return (
                      <td key={key} className="px-4 py-3">
                        <label className="block">
                          <span className="sr-only">
                            {meta.label} {label}
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              step={key === "responseHours" ? 0.25 : 1}
                              value={
                                Number.isFinite(draft[priority][key]) ? draft[priority][key] : ""
                              }
                              onChange={(e) => setField(priority, key, e.target.value)}
                              aria-invalid={Boolean(err)}
                              className={`${inputClass} max-w-24 ${err ? "border-danger" : ""}`}
                            />
                            <span className="text-xs text-charcoal-400">hrs</span>
                          </div>
                          {err && <span className={errorTextClass}>{err}</span>}
                        </label>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-charcoal-600">
                    {Number.isFinite(draft[priority].resolutionHours)
                      ? formatSlaHours(draft[priority].resolutionHours)
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section
        className="rounded-xl border border-border bg-muted/50 p-4 text-sm text-charcoal-600"
        aria-label="Policy notes"
      >
        <p className={fieldLabelClass + " mb-1"}>How this policy is applied</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Critical priority: the intake modal computes the due date from the resolution target.
          </li>
          <li>The dispatch board&apos;s SLA countdown and breach flags use the same targets.</li>
          <li>
            Vendor response contracts must meet or beat the on-site targets to stay preferred.
          </li>
        </ul>
      </section>
    </div>
  );
}

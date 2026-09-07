"use client";

import { useState } from "react";
import { ArrowRight, ClipboardList, MapPin, Mic, Send, Siren, User, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusIndicator";
import { useToast } from "@/components/ui/Toast";
import { PhotoCapture } from "@/components/field/PhotoCapture";
import { SignatureCapture } from "@/components/field/SignatureCapture";
import { VoiceMemoButton } from "@/components/field/VoiceMemoButton";
import { ChecklistStepper } from "./ChecklistStepper";
import { PRIORITY_META } from "@/lib/statuses";
import { useOpsStore } from "@/lib/store";
import { formatRelative, isSlaBreached } from "@/lib/utils";
import type { WorkOrder } from "@/lib/types";

/** Split-view detail panel for desktop, full-screen sheet on mobile. */
export function WorkOrderDetail({ workOrder }: { workOrder: WorkOrder }) {
  const advanceStatus = useOpsStore((s) => s.advanceStatus);
  const addNote = useOpsStore((s) => s.addNote);
  const { toast } = useToast();
  const [noteDraft, setNoteDraft] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);

  const breached =
    workOrder.slaDueAt && isSlaBreached(workOrder.slaDueAt) && workOrder.status !== "completed";
  const isEmergency = workOrder.priority === "critical";

  const handleAdvance = () => {
    advanceStatus(workOrder.id);
    const reachedCompletion = workOrder.status === "in_progress";
    toast({
      title: reachedCompletion
        ? `${workOrder.number} marked completed`
        : `${workOrder.number} advanced`,
      description: reachedCompletion
        ? "Completion record filed. Signature capture is available below."
        : "Status synced to the dispatch board.",
      variant: "success",
    });
  };

  const handleAddNote = () => {
    const body = noteDraft.trim();
    if (!body) return;
    addNote(workOrder.id, body, "typed");
    setNoteDraft("");
    toast({ title: "Note added", variant: "success" });
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={workOrder.status} />
          <Badge variant={PRIORITY_META[workOrder.priority].badgeVariant}>
            {PRIORITY_META[workOrder.priority].label}
          </Badge>
          {isEmergency && (
            <Badge variant="critical">
              <Siren aria-hidden className="mr-1 inline h-3 w-3" />
              Emergency dispatch
            </Badge>
          )}
          {breached && <Badge variant="danger">SLA breached</Badge>}
          <span className="ml-auto font-mono text-sm font-bold text-charcoal-400">
            {workOrder.number}
          </span>
        </div>
        <h2 className="mt-3 font-heading text-2xl font-bold leading-tight">{workOrder.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {workOrder.description}
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-3 rounded-xl bg-muted/60 p-4 text-sm">
        <div className="col-span-2 sm:col-span-1">
          <dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-charcoal-500">
            <MapPin aria-hidden className="h-3.5 w-3.5" /> Location
          </dt>
          <dd className="mt-1 font-semibold">
            {workOrder.location}
            <span className="block text-xs font-normal text-muted-foreground">
              Floor {workOrder.floor}
            </span>
          </dd>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-charcoal-500">
            <ClipboardList aria-hidden className="h-3.5 w-3.5" /> Asset
          </dt>
          <dd className="mt-1 font-mono text-xs font-bold text-charcoal-700">
            {workOrder.assetTag ?? "—"}
          </dd>
        </div>
        <div className="col-span-1">
          <dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-charcoal-500">
            <User aria-hidden className="h-3.5 w-3.5" /> Requested by
          </dt>
          <dd className="mt-1 font-semibold">{workOrder.requestedBy}</dd>
        </div>
        <div className="col-span-1">
          <dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-charcoal-500">
            <Wrench aria-hidden className="h-3.5 w-3.5" /> Assigned to
          </dt>
          <dd className="mt-1 font-semibold">
            {workOrder.assignedTechnician ?? workOrder.assignedVendor ?? "Unassigned"}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={handleAdvance}
          disabled={workOrder.status === "completed"}
        >
          {workOrder.status === "completed"
            ? "Completed"
            : workOrder.status === "in_progress"
              ? "Mark Completed"
              : "Advance Status"}
          {workOrder.status !== "completed" && <ArrowRight aria-hidden className="ml-2 h-5 w-5" />}
        </Button>
        {workOrder.slaDueAt && !breached && workOrder.status !== "completed" && (
          <span className="text-sm font-semibold text-charcoal-600">
            SLA due {formatRelative(workOrder.slaDueAt)}
          </span>
        )}
      </div>

      <section>
        <h3 className="mb-3 font-heading text-sm font-bold uppercase tracking-widest text-charcoal-700">
          Field checklist
        </h3>
        <ChecklistStepper workOrder={workOrder} />
      </section>

      <section>
        <h3 className="mb-3 font-heading text-sm font-bold uppercase tracking-widest text-charcoal-700">
          Work notes
        </h3>

        {workOrder.notes.length > 0 ? (
          <ul className="space-y-3">
            {workOrder.notes.map((note) => (
              <li key={note.id} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-charcoal-700">{note.author}</span>
                  <span className="text-charcoal-400">{formatRelative(note.createdAt)}</span>
                  {note.source === "voice" && (
                    <Badge variant="info" className="!px-2 !py-0.5">
                      <Mic aria-hidden className="mr-1 inline h-3 w-3" />
                      Voice
                    </Badge>
                  )}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-charcoal-800">{note.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
            No notes yet — add the first update from the field.
          </p>
        )}

        {composerOpen ? (
          <div className="mt-3 flex items-end gap-3">
            <label className="flex-1">
              <span className="sr-only">Add a work note</span>
              <textarea
                rows={2}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Condition found, parts used, next steps…"
                className="focus-ring w-full rounded-lg border border-input bg-card p-3 text-sm"
              />
            </label>
            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleAddNote}
                disabled={!noteDraft.trim()}
              >
                <Send aria-hidden className="mr-2 h-4 w-4" />
                Post
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setComposerOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-3">
            <Button variant="outline" size="md" onClick={() => setComposerOpen(true)}>
              Add Note
            </Button>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-charcoal-500">
              Voice memo
              <VoiceMemoButton workOrderId={workOrder.id} />
            </div>
          </div>
        )}
      </section>

      <PhotoCapture workOrderNumber={workOrder.number} />
      <SignatureCapture workOrderNumber={workOrder.number} />
    </div>
  );
}

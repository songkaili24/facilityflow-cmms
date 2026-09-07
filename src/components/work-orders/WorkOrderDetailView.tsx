"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  ChevronLeft,
  CircleAlert,
  Link2,
  MapPin,
  Send,
  TriangleAlert,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatusBadge, StatusDot } from "@/components/ui/StatusIndicator";
import { useToast } from "@/components/ui/Toast";
import { inputClass } from "@/components/ui/formControls";
import { PRIORITY_META, STATUS_META, STATUS_ORDER } from "@/lib/statuses";
import { useOpsStore } from "@/lib/store";
import { useTechnicianLookup } from "@/lib/hooks";
import { cn, formatDateTime, formatLocation, formatRelative } from "@/lib/utils";
import type { WorkOrder } from "@/lib/types";
import { ActivityTimeline } from "./ActivityTimeline";
import { PartsChecklist } from "./PartsChecklist";
import { SlaCountdown } from "./SlaCountdown";
import { StatusStepper } from "./StatusStepper";
import { TechnicianCard } from "./TechnicianCard";

export function WorkOrderDetailView({ id }: { id: string }) {
  const workOrder = useOpsStore((s) => s.workOrders.find((wo) => wo.id === id));
  const allWorkOrders = useOpsStore((s) => s.workOrders);
  const setStatus = useOpsStore((s) => s.setStatus);
  const addComment = useOpsStore((s) => s.addComment);
  const attachPhotos = useOpsStore((s) => s.attachPhotos);
  const escalate = useOpsStore((s) => s.escalate);
  const { toast } = useToast();
  const { technicianById, technicianName } = useTechnicianLookup();

  const [composerOpen, setComposerOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!workOrder) {
    return (
      <div className="rounded-xl border border-dashed border-charcoal-200 bg-card p-10 text-center shadow-card">
        <CircleAlert aria-hidden className="mx-auto h-8 w-8 text-charcoal-300" />
        <h1 className="mt-3 font-heading text-xl font-bold">Work order not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          It may have been archived or the link is stale.
        </p>
        <Link href="/workorders" className="mt-4 inline-block">
          <Button variant="outline" size="md">
            Back to board
          </Button>
        </Link>
      </div>
    );
  }

  const wo = workOrder;
  const tech = technicianById(wo.assigneeId);
  const nextStatus =
    STATUS_ORDER[Math.min(STATUS_ORDER.indexOf(wo.status) + 1, STATUS_ORDER.length - 1)] ??
    "reported";
  const closed = wo.status === "completed" || wo.status === "verified";
  const related = allWorkOrders.filter(
    (other) => other.assetId && other.assetId === wo.assetId && other.id !== wo.id
  );

  const handleUpdateStatus = () => {
    if (wo.status === "verified") return;
    setStatus(wo.id, nextStatus);
    toast({
      title: `${wo.number} → ${STATUS_META[nextStatus].label}`,
      description: "Status logged to the activity timeline.",
      variant: "success",
    });
  };

  const handleAddNote = () => {
    const body = noteDraft.trim();
    if (!body) return;
    addComment(wo.id, body);
    setNoteDraft("");
    toast({ title: "Note added to timeline", variant: "success" });
  };

  const handleEscalate = () => {
    escalate(wo.id);
    toast({
      title: `${wo.number} escalated`,
      description: "Priority set to critical and the duty supervisor was notified.",
      variant: "warning",
    });
  };

  const actionButton =
    "focus-ring inline-flex min-h-12 items-center gap-2 rounded-lg px-4 text-sm font-bold uppercase tracking-wide";

  return (
    <div className="space-y-4">
      <Link
        href="/workorders"
        className="focus-ring inline-flex min-h-12 items-center gap-1 rounded-lg text-sm font-semibold text-charcoal-600 hover:text-charcoal-900"
      >
        <ChevronLeft aria-hidden className="h-4 w-4" />
        Back to board
      </Link>

      {/* Header */}
      <header className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-bold text-charcoal-500">{wo.number}</span>
          <StatusBadge status={wo.status} />
          <Badge variant={PRIORITY_META[wo.priority].badgeVariant}>
            {PRIORITY_META[wo.priority].label}
          </Badge>
          {wo.isEmergency && (
            <Badge variant="critical">
              <TriangleAlert aria-hidden className="mr-1 inline h-3 w-3" />
              Emergency
            </Badge>
          )}
          <span
            className="ml-auto hidden text-xs font-semibold text-charcoal-400 sm:block"
            suppressHydrationWarning
          >
            Reported {formatRelative(wo.reportedAt)}
          </span>
        </div>
        <h1 className="mt-2 font-heading text-2xl font-bold leading-tight">{wo.title}</h1>

        <div className="mt-5">
          <StatusStepper status={wo.status} />
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={handleUpdateStatus}
            disabled={wo.status === "verified"}
            className={cn(
              actionButton,
              "bg-accent text-white hover:bg-accent/90 disabled:opacity-40"
            )}
          >
            {wo.status === "verified" ? "Verified ✓" : "Update Status"}
            {wo.status !== "verified" && <ArrowRight aria-hidden className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setComposerOpen(true)}
            className={cn(
              actionButton,
              "border border-input bg-card text-charcoal-800 hover:bg-muted"
            )}
          >
            Add Note
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn(
              actionButton,
              "border border-input bg-card text-charcoal-800 hover:bg-muted"
            )}
          >
            <Camera aria-hidden className="h-4 w-4" />
            Upload Photo
          </button>
          <button
            type="button"
            onClick={handleEscalate}
            disabled={wo.priority === "critical"}
            className={cn(
              actionButton,
              "border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20 disabled:opacity-40"
            )}
          >
            <TriangleAlert aria-hidden className="h-4 w-4" />
            Escalate
          </button>
          <button
            type="button"
            onClick={() => {
              setStatus(wo.id, "completed");
              toast({
                title: `${wo.number} closed`,
                description: "Marked completed — verification pending.",
                variant: "success",
              });
            }}
            disabled={closed}
            className={cn(
              actionButton,
              "bg-charcoal-800 text-white hover:bg-charcoal-700 disabled:opacity-40"
            )}
          >
            Close
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            aria-label="Upload photos"
            onChange={(e) => {
              const count = e.target.files?.length ?? 0;
              if (count > 0) {
                attachPhotos(wo.id, count, "Photos uploaded from the field");
                toast({
                  title: `${count} photo${count > 1 ? "s" : ""} attached`,
                  variant: "success",
                });
              }
              e.target.value = "";
            }}
          />
        </div>

        {composerOpen && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <label className="flex-1">
              <span className="sr-only">Add a note</span>
              <textarea
                rows={2}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Condition found, parts used, next steps…"
                className={cn(inputClass, "py-2")}
              />
            </label>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleAddNote}
                disabled={!noteDraft.trim()}
              >
                <Send aria-hidden className="mr-2 h-4 w-4" />
                Post
              </Button>
              <Button variant="ghost" size="md" onClick={() => setComposerOpen(false)}>
                <X aria-hidden className="mr-1 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main column */}
        <div className="space-y-6">
          <section
            className="rounded-xl border border-border bg-card p-5 shadow-card"
            aria-label="Reported issue"
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500">
              Reported issue
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal-700">{wo.description}</p>
            {wo.photos.length > 0 && (
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {wo.photos.map((photo) => (
                  <li
                    key={photo.id}
                    className="flex min-h-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-charcoal-200 bg-muted/50 p-2 text-center"
                  >
                    <Camera aria-hidden className="h-5 w-5 text-charcoal-300" />
                    <span className="text-[11px] font-medium leading-tight text-charcoal-500">
                      {photo.caption}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            className="rounded-xl border border-border bg-card p-5 shadow-card"
            aria-label="Location"
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500">
              Location
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {(["building", "floor", "zone", "room"] as const).map((key) => (
                <div key={key}>
                  <dt className="text-xs font-bold uppercase tracking-wide text-charcoal-400">
                    {key}
                  </dt>
                  <dd className="mt-0.5 font-semibold text-charcoal-800">
                    {wo.location[key] ?? "—"}
                  </dd>
                </div>
              ))}
            </dl>
            {wo.assetId && (
              <p className="mt-3 flex items-center gap-1.5 text-sm">
                <Link2 aria-hidden className="h-4 w-4 text-accent" />
                <Link
                  href={`/assets/${wo.assetId}`}
                  className="focus-ring rounded font-semibold text-accent underline-offset-2 hover:underline"
                >
                  View asset record
                </Link>
              </p>
            )}
            <div
              aria-hidden
              className="mt-4 flex min-h-36 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-charcoal-200 bg-muted/40 text-center"
            >
              <MapPin className="h-6 w-6 text-charcoal-300" />
              <span className="text-xs font-semibold text-charcoal-400">
                Floor plan placeholder — {formatLocation(wo.location)}
              </span>
            </div>
          </section>

          <TechnicianCard technicianId={wo.assigneeId} />

          <section
            className="rounded-xl border border-border bg-card p-5 shadow-card"
            aria-label="Parts and materials"
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500">
              Parts &amp; materials
            </h2>
            <div className="mt-3">
              <PartsChecklist workOrderId={wo.id} parts={wo.parts} />
            </div>
          </section>

          <section
            className="rounded-xl border border-border bg-card p-5 shadow-card"
            aria-label="Activity"
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500">
              Activity timeline
            </h2>
            <div className="mt-4">
              <ActivityTimeline entries={wo.timeline} />
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <SlaCountdown dueAt={wo.dueAt} closed={closed} />

          <section
            className="rounded-xl border border-border bg-card p-4 shadow-card"
            aria-label="Work order details"
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500">
              Details
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-charcoal-500">Reported by</dt>
                <dd className="text-right font-semibold text-charcoal-800">{wo.reportedBy}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-charcoal-500">Reported</dt>
                <dd className="text-right font-semibold text-charcoal-800" suppressHydrationWarning>
                  {formatRelative(wo.reportedAt)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-charcoal-500">Category</dt>
                <dd className="text-right font-semibold text-charcoal-800">{wo.category}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-charcoal-500">Assignee</dt>
                <dd className="text-right font-semibold text-charcoal-800">
                  {technicianName(wo.assigneeId)}
                </dd>
              </div>
              {wo.completedAt && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-charcoal-500">Completed</dt>
                  <dd className="text-right font-semibold text-charcoal-800">
                    {formatDateTime(wo.completedAt)}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section
            className="rounded-xl border border-border bg-card p-4 shadow-card"
            aria-label="Related work orders"
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500">
              Related work orders
            </h2>
            {related.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No other work orders on this asset.
              </p>
            ) : (
              <ul className="mt-2 space-y-1">
                {related.map((other) => (
                  <li key={other.id}>
                    <Link
                      href={`/workorders/${other.id}`}
                      className="focus-ring flex min-h-12 items-center gap-2 rounded-lg px-2 hover:bg-muted"
                    >
                      <StatusDot status={other.status} />
                      <span className="font-mono text-xs font-bold text-charcoal-500">
                        {other.number}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-charcoal-700">
                        {other.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

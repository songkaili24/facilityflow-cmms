"use client";

import { useState } from "react";
import { Siren } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface EmergencyTopic {
  id: string;
  label: string;
  detail: string;
}

const TOPICS: EmergencyTopic[] = [
  { id: "flood", label: "Major leak / flooding", detail: "Pages on-call plumbing crew" },
  { id: "power", label: "Power outage", detail: "Pages electrician + building engineer" },
  { id: "entrapment", label: "Elevator entrapment", detail: "Pages elevator vendor — 1h SLA" },
  { id: "fire", label: "Fire / life safety event", detail: "Pages security + fire marshal" },
  { id: "hvac", label: "HVAC outage", detail: "Pages mechanical vendor" },
  { id: "security", label: "Security / access issue", detail: "Pages security operations" },
];

/** Simulated dispatch endpoint (swap for POST /api/emergency-dispatch). */
function dispatchEmergency(topic: EmergencyTopic): Promise<{ etaMinutes: number }> {
  return new Promise((resolve) => setTimeout(() => resolve({ etaMinutes: 6 }), 900));
}

export function EmergencyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [selected, setSelected] = useState<string | null>(null);
  const [dispatching, setDispatching] = useState(false);

  if (!open) return null;

  const handleDispatch = async () => {
    const topic = TOPICS.find((t) => t.id === selected);
    if (!topic) return;
    setDispatching(true);
    const { etaMinutes } = await dispatchEmergency(topic);
    setDispatching(false);
    onClose();
    setSelected(null);
    toast({
      title: "Emergency dispatch sent",
      description: `${topic.label} — on-call notified, ETA ${etaMinutes} min. Control desk is standing by.`,
      variant: "danger",
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Emergency dispatch"
      className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-charcoal-900/70 p-0 sm:items-center sm:p-6"
    >
      <div className="w-full max-w-lg animate-slide-up rounded-t-2xl bg-card p-6 shadow-popped sm:rounded-2xl">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-danger/15">
            <Siren aria-hidden className="h-6 w-6 text-danger" />
          </span>
          <div>
            <h2 className="font-heading text-2xl font-bold">Emergency dispatch</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pages the on-call rotation and the control desk immediately. Use for active events
              only — not for same-day requests.
            </p>
          </div>
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-charcoal-700">Select event type</legend>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TOPICS.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSelected(topic.id)}
                aria-pressed={selected === topic.id}
                className={cnTap(selected === topic.id)}
              >
                <span className="block text-left text-base font-semibold">{topic.label}</span>
                <span className="mt-0.5 block text-left text-xs text-charcoal-600">
                  {topic.detail}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" size="lg" onClick={onClose} disabled={dispatching}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={handleDispatch}
            disabled={!selected || dispatching}
          >
            {dispatching ? "Dispatching…" : "Dispatch Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function cnTap(active: boolean): string {
  return [
    "focus-ring rounded-xl border-2 p-4 text-charcoal-800 transition-colors",
    active ? "border-danger bg-danger/10" : "border-input bg-background hover:border-charcoal-400",
  ].join(" ");
}

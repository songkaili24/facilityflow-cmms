"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  fieldLabelClass,
  inputClass,
  textareaClass,
  errorTextClass,
} from "@/components/ui/formControls";
import { useOpsStore } from "@/lib/store";
import { formatMoney } from "@/lib/utils";
import type { InventoryItem } from "@/lib/types";

/**
 * Parts requisition against the storeroom: quantity must be a positive
 * integer and cannot exceed on-hand stock (backorders route to the
 * supplier order flow instead).
 */
export function RequisitionModal({
  item,
  onClose,
}: {
  item: InventoryItem | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const requisitionPart = useOpsStore((s) => s.requisitionPart);
  const [qty, setQty] = useState("1");
  const [requestedBy, setRequestedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!item) return null;

  const parsed = Number.parseInt(qty, 10);

  const submit = () => {
    const result = requisitionPart(item.id, parsed, notes.trim());
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast({
      title: `Requisition filled — ${parsed} ${item.unit} × ${item.name}`,
      description: `${result.item.quantity} ${item.unit} remaining in ${item.location}. Charged to ${requestedBy.trim() || "building ops"}.`,
      variant: "success",
    });
    onClose();
  };

  const invalid = Number.isNaN(parsed) || parsed < 1 || parsed > item.quantity;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="requisition-title"
      className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-charcoal-900/70 sm:items-center sm:p-6"
    >
      <div className="w-full max-w-md animate-slide-up rounded-t-2xl bg-card p-6 shadow-popped sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="requisition-title" className="font-heading text-xl font-bold">
              Requisition Parts
            </h2>
            <p className="mt-0.5 font-mono text-xs font-bold text-charcoal-400">{item.sku}</p>
          </div>
          <Button variant="ghost" size="md" onClick={onClose} aria-label="Close form">
            <X aria-hidden className="h-5 w-5" />
          </Button>
        </div>

        <dl className="mt-4 space-y-1.5 rounded-lg bg-muted/60 p-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-charcoal-500">Item</dt>
            <dd className="text-right font-semibold">{item.name}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-charcoal-500">On hand</dt>
            <dd className="text-right font-bold">
              {item.quantity} {item.unit}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-charcoal-500">Est. value</dt>
            <dd className="text-right font-bold">
              {Number.isNaN(parsed) || parsed < 0 ? "—" : formatMoney(parsed * item.unitCost)}
            </dd>
          </div>
        </dl>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <label className="block">
            <span className={fieldLabelClass}>
              Quantity ({item.unit}) — on hand: {item.quantity}
            </span>
            <input
              type="number"
              min={1}
              step={1}
              max={item.quantity}
              value={qty}
              onChange={(e) => {
                setQty(e.target.value);
                setError(null);
              }}
              className={inputClass}
              autoFocus
              required
            />
            {error && <span className={errorTextClass}>{error}</span>}
            {!error && invalid && (
              <span className={errorTextClass}>
                Enter a whole number between 1 and {item.quantity}.
              </span>
            )}
          </label>

          <label className="block">
            <span className={fieldLabelClass}>Requested by</span>
            <input
              type="text"
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
              placeholder="e.g., WO-2101 / M. Webb"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className={fieldLabelClass}>Notes (optional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Work order number, purpose, delivery point…"
              className={textareaClass}
            />
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button variant="outline" size="lg" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="lg" type="submit" disabled={invalid}>
              Fill Requisition
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

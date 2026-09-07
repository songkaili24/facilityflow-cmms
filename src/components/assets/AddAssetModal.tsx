"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { fieldLabelClass, inputClass, selectClass } from "@/components/ui/formControls";
import { useOpsStore } from "@/lib/store";
import {
  BUILDINGS,
  FLOORS_BY_BUILDING,
  WORK_ORDER_CATEGORIES,
  ZONES,
  type AssetCriticality,
  type WorkOrderCategory,
} from "@/lib/types";

/** Add-asset form for physical equipment tagging. */
export function AddAssetModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const addAsset = useOpsStore((s) => s.addAsset);

  const [tag, setTag] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<WorkOrderCategory>("HVAC");
  const [criticality, setCriticality] = useState<AssetCriticality>("medium");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [zone, setZone] = useState("");
  const [room, setRoom] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [installedAt, setInstalledAt] = useState("");
  const [warrantyEnds, setWarrantyEnds] = useState("");

  useEffect(() => {
    if (!open) return;
    setTag("");
    setName("");
    setCategory("HVAC");
    setCriticality("medium");
    setBuilding("");
    setFloor("");
    setZone("");
    setRoom("");
    setManufacturer("");
    setModel("");
    setInstalledAt("");
    setWarrantyEnds("");
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

  const canSubmit =
    tag.trim() !== "" &&
    name.trim() !== "" &&
    building !== "" &&
    floor !== "" &&
    installedAt !== "";

  const submit = () => {
    if (!canSubmit) return;
    const asset = addAsset({
      tag: tag.trim().toUpperCase(),
      name: name.trim(),
      category,
      location: { building, floor, zone: zone || undefined, room: room || undefined },
      manufacturer: manufacturer.trim() || "—",
      model: model.trim() || "—",
      installedAt,
      warrantyEnds: warrantyEnds || null,
      lastServiceAt: null,
      criticality,
    });
    toast({
      title: `${asset.tag} registered`,
      description: `${asset.name} added to the registry. Print the QR tag from the asset profile.`,
      variant: "success",
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-asset-title"
      className="fixed inset-0 z-50 animate-fade-in overflow-y-auto bg-charcoal-900/70"
    >
      <div className="mx-auto my-6 w-[calc(100%-2rem)] max-w-2xl animate-slide-up rounded-2xl bg-card p-6 shadow-popped">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="add-asset-title" className="font-heading text-2xl font-bold">
              Add Asset
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Register equipment for work order tracking and PM scheduling.
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
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={fieldLabelClass}>Asset tag</span>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g., AHU-07"
                className={inputClass}
                autoFocus
                required
              />
            </label>
            <label className="block">
              <span className={fieldLabelClass}>Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Air handling unit 7"
                className={inputClass}
                required
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
              <span className={fieldLabelClass}>Criticality</span>
              <select
                value={criticality}
                onChange={(e) => setCriticality(e.target.value as AssetCriticality)}
                className={selectClass}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
          </div>

          <fieldset className="rounded-lg border border-border p-4">
            <legend className={fieldLabelClass + " px-1"}>Location</legend>
            <div className="grid gap-3 sm:grid-cols-4">
              <label className="block">
                <span className={fieldLabelClass}>Building</span>
                <select
                  value={building}
                  onChange={(e) => {
                    setBuilding(e.target.value);
                    setFloor("");
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
                  onChange={(e) => setFloor(e.target.value)}
                  className={selectClass}
                  disabled={!building}
                  required
                >
                  <option value="">Select…</option>
                  {(building ? (FLOORS_BY_BUILDING[building] ?? []) : []).map((f) => (
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
                  onChange={(e) => setZone(e.target.value)}
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
                  className={inputClass}
                  disabled={!floor}
                  placeholder="e.g., 902"
                />
              </label>
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={fieldLabelClass}>Manufacturer</span>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className={inputClass}
                placeholder="e.g., Trane"
              />
            </label>
            <label className="block">
              <span className={fieldLabelClass}>Model</span>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className={inputClass}
                placeholder="e.g., Performance Climate Changer"
              />
            </label>
            <label className="block">
              <span className={fieldLabelClass}>Install date</span>
              <input
                type="date"
                value={installedAt}
                onChange={(e) => setInstalledAt(e.target.value)}
                className={inputClass}
                required
              />
            </label>
            <label className="block">
              <span className={fieldLabelClass}>Warranty ends (optional)</span>
              <input
                type="date"
                value={warrantyEnds}
                onChange={(e) => setWarrantyEnds(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button variant="outline" size="lg" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="lg" type="submit" disabled={!canSubmit}>
              Register Asset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

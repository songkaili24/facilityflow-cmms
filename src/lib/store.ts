"use client";

import { create } from "zustand";
import { ASSETS, PM_TASKS, WORK_ORDERS } from "./fixtures";
import type { BuildingAsset, PmTask, WorkOrder, WorkOrderDraft, WorkOrderStatus } from "./types";
import { STATUS_META } from "./statuses";

let seq = 2100;
let pmSeq = 108;
let assetSeq = 15;
let entrySeq = 0;

function nextNumber(): string {
  seq += 1;
  return `WO-${seq}`;
}

function entry(partial: Omit<import("./types").TimelineEntry, "id" | "at">) {
  return { id: `t-${entrySeq++}`, at: new Date().toISOString(), ...partial };
}

export interface WorkOrderFilters {
  query: string;
  priorities: string[];
  categories: string[];
  statuses: string[];
  assignees: string[];
}

const EMPTY_FILTERS: WorkOrderFilters = {
  query: "",
  priorities: [],
  categories: [],
  statuses: [],
  assignees: [],
};

interface OpsState {
  workOrders: WorkOrder[];
  pmTasks: PmTask[];
  assets: BuildingAsset[];
  filters: WorkOrderFilters;
  pendingSync: Record<string, number>;

  setQuery: (q: string) => void;
  setFilter: (facet: keyof Omit<WorkOrderFilters, "query">, values: string[]) => void;
  clearFilters: () => void;

  createWorkOrder: (draft: WorkOrderDraft) => WorkOrder;
  setStatus: (id: string, status: WorkOrderStatus) => void;
  addComment: (id: string, message: string) => void;
  attachPhotos: (id: string, count: number, message?: string) => void;
  togglePart: (workOrderId: string, partId: string) => void;
  escalate: (id: string) => void;
  dispatchVendor: (workOrderId: string, vendorId: string) => void;
  markSynced: (id: string) => void;

  schedulePm: (task: {
    title: string;
    taskType: string;
    frequency: PmTask["frequency"];
    assetId: string;
    assignedTechId: string | null;
    nextDue: string;
    estHours: number;
  }) => PmTask;
  completePm: (taskId: string, notes: string) => void;
  addAsset: (asset: Omit<BuildingAsset, "id">) => BuildingAsset;
}

export const useOpsStore = create<OpsState>((set) => ({
  workOrders: WORK_ORDERS,
  pmTasks: PM_TASKS,
  assets: ASSETS,
  filters: EMPTY_FILTERS,
  pendingSync: {},

  setQuery: (query) => set((s) => ({ filters: { ...s.filters, query } })),

  setFilter: (facet, values) => set((s) => ({ filters: { ...s.filters, [facet]: values } })),

  clearFilters: () => set({ filters: EMPTY_FILTERS }),

  createWorkOrder: (draft) => {
    const now = new Date().toISOString();
    const wo: WorkOrder = {
      id: `wo-${seq + 1}`,
      number: nextNumber(),
      title: draft.title,
      description: draft.description,
      status: "reported",
      priority: draft.priority,
      category: draft.category,
      location: draft.location,
      assetId: null,
      reportedBy: "Dana Reyes",
      reportedAt: now,
      dueAt: draft.dueAt,
      assigneeId: draft.assigneeId,
      vendorId: null,
      isEmergency: draft.priority === "critical",
      parts: [],
      photos: draft.photoCount
        ? Array.from({ length: draft.photoCount }, (_, i) => ({
            id: `ph-new-${i}`,
            caption: `Intake photo ${i + 1}`,
          }))
        : [],
      completedAt: null,
      timeline: [
        entry({ type: "status", actor: "Dana Reyes", to: "reported" }),
        ...(draft.assigneeId
          ? [entry({ type: "assignment", actor: "Dana Reyes", message: "Assigned at intake" })]
          : []),
      ],
    };
    set((s) => ({
      workOrders: [wo, ...s.workOrders],
      pendingSync: { ...s.pendingSync, [wo.id]: Date.now() },
    }));
    return wo;
  },

  setStatus: (id, status) =>
    set((s) => ({
      workOrders: s.workOrders.map((wo) =>
        wo.id === id && wo.status !== status
          ? {
              ...wo,
              status,
              completedAt:
                status === "completed"
                  ? (wo.completedAt ?? new Date().toISOString())
                  : wo.completedAt,
              timeline: [
                ...wo.timeline,
                entry({
                  type: "status",
                  actor: "Dana Reyes",
                  from: STATUS_META[wo.status].label,
                  to: STATUS_META[status].label,
                }),
              ],
            }
          : wo
      ),
      pendingSync: { ...s.pendingSync, [id]: Date.now() },
    })),

  addComment: (id, message) =>
    set((s) => ({
      workOrders: s.workOrders.map((wo) =>
        wo.id === id
          ? {
              ...wo,
              timeline: [...wo.timeline, entry({ type: "comment", actor: "Dana Reyes", message })],
            }
          : wo
      ),
      pendingSync: { ...s.pendingSync, [id]: Date.now() },
    })),

  attachPhotos: (id, count, message) =>
    set((s) => ({
      workOrders: s.workOrders.map((wo) =>
        wo.id === id
          ? {
              ...wo,
              photos: [
                ...wo.photos,
                ...Array.from({ length: count }, (_, i) => ({
                  id: `ph-${entrySeq++}-${i}`,
                  caption: `Field photo ${wo.photos.length + i + 1}`,
                })),
              ],
              timeline: [
                ...wo.timeline,
                entry({ type: "photo", actor: "Dana Reyes", message, photoCount: count }),
              ],
            }
          : wo
      ),
      pendingSync: { ...s.pendingSync, [id]: Date.now() },
    })),

  togglePart: (workOrderId, partId) =>
    set((s) => ({
      workOrders: s.workOrders.map((wo) =>
        wo.id === workOrderId
          ? {
              ...wo,
              parts: wo.parts.map((p) =>
                p.id === partId
                  ? { ...p, status: p.status === "on_hand" ? "ordered" : "on_hand" }
                  : p
              ),
            }
          : wo
      ),
      pendingSync: { ...s.pendingSync, [workOrderId]: Date.now() },
    })),

  escalate: (id) =>
    set((s) => ({
      workOrders: s.workOrders.map((wo) =>
        wo.id === id
          ? {
              ...wo,
              priority: "critical",
              isEmergency: true,
              timeline: [
                ...wo.timeline,
                entry({
                  type: "comment",
                  actor: "Dana Reyes",
                  message: "Escalated to critical priority",
                }),
              ],
            }
          : wo
      ),
      pendingSync: { ...s.pendingSync, [id]: Date.now() },
    })),

  dispatchVendor: (workOrderId, vendorId) =>
    set((s) => ({
      workOrders: s.workOrders.map((wo) =>
        wo.id === workOrderId
          ? {
              ...wo,
              vendorId,
              status: wo.status === "reported" ? "assigned" : wo.status,
              timeline: [
                ...wo.timeline,
                entry({ type: "assignment", actor: "Dana Reyes", message: "Vendor dispatched" }),
              ],
            }
          : wo
      ),
      pendingSync: { ...s.pendingSync, [workOrderId]: Date.now() },
    })),

  markSynced: (id) =>
    set((s) => {
      const next = { ...s.pendingSync };
      delete next[id];
      return { pendingSync: next };
    }),

  schedulePm: (task) => {
    pmSeq += 1;
    const scheduled: PmTask = {
      ...task,
      id: `pm-${pmSeq}`,
      number: `PM-${pmSeq}`,
      vendorId: null,
      history: [],
    };
    set((s) => ({
      pmTasks: [...s.pmTasks, scheduled],
      pendingSync: { ...s.pendingSync, [scheduled.id]: Date.now() },
    }));
    return scheduled;
  },

  completePm: (taskId, notes) =>
    set((s) => ({
      pmTasks: s.pmTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              history: [
                ...task.history,
                {
                  completedAt: new Date().toISOString(),
                  completedBy: "Dana Reyes",
                  notes,
                },
              ],
            }
          : task
      ),
      pendingSync: { ...s.pendingSync, [taskId]: Date.now() },
    })),

  addAsset: (asset) => {
    assetSeq += 1;
    const created: BuildingAsset = { ...asset, id: `ast-new-${assetSeq}` };
    set((s) => ({
      assets: [...s.assets, created],
      pendingSync: { ...s.pendingSync, [created.id]: Date.now() },
    }));
    return created;
  },
}));

/** Filter + search pipeline for the dispatch board. */
export function filterWorkOrders(
  workOrders: WorkOrder[],
  filters: WorkOrderFilters,
  techNameFor: (id: string | null) => string
): WorkOrder[] {
  const q = filters.query.trim().toLowerCase();
  return workOrders
    .filter((wo) => {
      if (filters.priorities.length && !filters.priorities.includes(wo.priority)) return false;
      if (filters.categories.length && !filters.categories.includes(wo.category)) return false;
      if (filters.statuses.length && !filters.statuses.includes(wo.status)) return false;
      if (filters.assignees.length) {
        const name = techNameFor(wo.assigneeId);
        if (!filters.assignees.includes(wo.assigneeId ?? "") && !filters.assignees.includes(name))
          return false;
      }
      if (q) {
        const haystack = `${wo.number} ${wo.title} ${wo.location.building} ${wo.location.floor} ${
          wo.location.zone ?? ""
        } ${wo.location.room ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
}

"use client";

import { create } from "zustand";
import { WORK_ORDERS } from "./fixtures";
import type { WorkOrder, WorkOrderCategory, WorkOrderNote } from "./types";

export type WorkOrderFilter = "active" | "all" | WorkOrderCategory;

const initialWorkOrders: WorkOrder[] = WORK_ORDERS;

interface OpsState {
  /** Work orders now (editable copy of fixtures). */
  workOrders: WorkOrder[];
  /** Categories/active filter applied to the board and list. */
  filter: WorkOrderFilter;
  /** Uppercase mapping id -> client timestamp of last sync; presence = queued. */
  pendingSync: Record<string, number>;
  /** Emergency dialog open. */
  emergencyOpen: boolean;

  setFilter: (filter: WorkOrderFilter) => void;
  advanceStatus: (id: string) => void;
  moveToStatus: (id: string, status: WorkOrder["status"]) => void;
  toggleChecklistItem: (workOrderId: string, itemId: string) => void;
  addNote: (workOrderId: string, body: string, source: WorkOrderNote["source"]) => void;
  reassignVendor: (workOrderId: string, vendorName: string) => void;
  markSynced: (workOrderId: string) => void;
  setEmergencyOpen: (open: boolean) => void;
}

const NEXT_STATUS: Record<WorkOrder["status"], WorkOrder["status"]> = {
  new: "assigned",
  assigned: "in_progress",
  in_progress: "completed",
  on_hold: "assigned",
  completed: "completed",
};

let noteSeq = 0;

export const useOpsStore = create<OpsState>((set) => ({
  workOrders: initialWorkOrders,
  filter: "active",
  pendingSync: {},
  emergencyOpen: false,

  setFilter: (filter) => set({ filter }),

  advanceStatus: (id) =>
    set((state) => ({
      workOrders: state.workOrders.map((wo) =>
        wo.id === id ? { ...wo, status: NEXT_STATUS[wo.status] } : wo
      ),
      pendingSync: { ...state.pendingSync, [id]: Date.now() },
    })),

  moveToStatus: (id, status) =>
    set((state) => ({
      workOrders: state.workOrders.map((wo) =>
        wo.id === id && wo.status !== status
          ? {
              ...wo,
              status,
              completedAt:
                status === "completed" ? (wo.completedAt ?? new Date().toISOString()) : null,
            }
          : wo
      ),
      pendingSync: { ...state.pendingSync, [id]: Date.now() },
    })),

  toggleChecklistItem: (workOrderId, itemId) =>
    set((state) => ({
      workOrders: state.workOrders.map((wo) =>
        wo.id === workOrderId
          ? {
              ...wo,
              checklist: wo.checklist.map((item) =>
                item.id === itemId ? { ...item, done: !item.done } : item
              ),
            }
          : wo
      ),
      pendingSync: { ...state.pendingSync, [workOrderId]: Date.now() },
    })),

  addNote: (workOrderId, body, source) =>
    set((state) => ({
      workOrders: state.workOrders.map((wo) =>
        wo.id === workOrderId
          ? {
              ...wo,
              notes: [
                ...wo.notes,
                {
                  id: `local-${noteSeq++}`,
                  author: "Dana Reyes",
                  body,
                  createdAt: new Date().toISOString(),
                  source,
                },
              ],
            }
          : wo
      ),
      pendingSync: { ...state.pendingSync, [workOrderId]: Date.now() },
    })),

  reassignVendor: (workOrderId, vendorName) =>
    set((state) => ({
      workOrders: state.workOrders.map((wo) =>
        wo.id === workOrderId
          ? {
              ...wo,
              assignedVendor: vendorName,
              assignedTechnician: "Pending vendor ETA",
              status: "assigned" as const,
            }
          : wo
      ),
      pendingSync: { ...state.pendingSync, [workOrderId]: Date.now() },
    })),

  markSynced: (workOrderId) =>
    set((state) => {
      const next = { ...state.pendingSync };
      delete next[workOrderId];
      return { pendingSync: next };
    }),

  setEmergencyOpen: (open) => set({ emergencyOpen: open }),
}));

/* -------- selectors (pure helpers usable from server or client) -------- */

export function selectActiveWorkOrders(workOrders: WorkOrder[]): WorkOrder[] {
  return workOrders.filter((wo) => wo.status !== "completed");
}

export function selectCriticalOpen(workOrders: WorkOrder[]): WorkOrder[] {
  return workOrders.filter((wo) => wo.priority === "critical" && wo.status !== "completed");
}

export function selectOverdue(workOrders: WorkOrder[]): WorkOrder[] {
  const now = Date.now();
  return workOrders.filter(
    (wo) => wo.status !== "completed" && wo.slaDueAt && new Date(wo.slaDueAt).getTime() < now
  );
}

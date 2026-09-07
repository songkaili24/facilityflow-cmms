"use client";

import useSWR from "swr";
import { useMemo } from "react";
import { ASSETS, PM_TASKS, VENDORS } from "./fixtures";
import { useOpsStore } from "./store";
import type { BuildingAsset, PreventiveMaintenanceTask, Vendor, WorkOrder } from "./types";

/**
 * Demo data layer: SWR-backed hooks reading from static fixtures.
 * Swap `fetcher` implementations for API routes when the backend lands —
 * components keep consuming the same hooks.
 */

const networkFetcher = async <T>(key: string): Promise<T> => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  switch (key) {
    case "work-orders":
      return useOpsStore.getState().workOrders as T;
    case "pm-tasks":
      return PM_TASKS as T;
    case "vendors":
      return VENDORS as T;
    case "assets":
      return ASSETS as T;
    default:
      throw new Error(`Unknown SWR key: ${key}`);
  }
};

export function useWorkOrders() {
  const workOrders = useOpsStore((s) => s.workOrders);
  const { data, error, isLoading, mutate } = useSWR<WorkOrder[]>("work-orders", networkFetcher, {
    fallbackData: workOrders,
  });

  return {
    workOrders: data ?? workOrders,
    error,
    isLoading,
    mutate,
  };
}

export function usePmTasks() {
  const { data, error, isLoading } = useSWR<PreventiveMaintenanceTask[]>(
    "pm-tasks",
    networkFetcher,
    {
      fallbackData: PM_TASKS,
    }
  );
  return { pmTasks: data ?? PM_TASKS, error, isLoading };
}

export function useVendors() {
  const { data, error, isLoading } = useSWR<Vendor[]>("vendors", networkFetcher, {
    fallbackData: VENDORS,
  });
  return { vendors: data ?? VENDORS, error, isLoading };
}

export function useAssets() {
  const { data, error, isLoading } = useSWR<BuildingAsset[]>("assets", networkFetcher, {
    fallbackData: ASSETS,
  });
  return { assets: data ?? ASSETS, error, isLoading };
}

export function useOpsMetrics() {
  const { workOrders } = useWorkOrders();

  return useMemo(() => {
    const active = workOrders.filter((wo) => wo.status !== "completed");
    const completed = workOrders.filter((wo) => wo.status === "completed");
    const now = Date.now();
    const overdue = active.filter((wo) => wo.slaDueAt && new Date(wo.slaDueAt).getTime() < now);
    const critical = active.filter((wo) => wo.priority === "critical");
    return { active, completed, overdue, critical };
  }, [workOrders]);
}

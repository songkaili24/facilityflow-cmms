"use client";

import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import { TECHNICIANS, VENDORS } from "./fixtures";
import { useOpsStore } from "./store";

/**
 * Demo data layer. Work orders live in the ops store (they mutate); vendors
 * and technicians are reference data via SWR. Swap the fetchers for API
 * routes when the backend lands — components keep consuming these hooks.
 */

const vendorFetcher = async (): Promise<typeof VENDORS> => {
  // Demo latency window: long enough for the skeleton loaders to be
  // exercised on real routes, short enough not to feel slow.
  await new Promise((resolve) => setTimeout(resolve, 450));
  return VENDORS;
};

export function useWorkOrders() {
  const workOrders = useOpsStore((s) => s.workOrders);
  return { workOrders };
}

export function usePmTasks() {
  const pmTasks = useOpsStore((s) => s.pmTasks);
  return { pmTasks };
}

export function useAssets() {
  const assets = useOpsStore((s) => s.assets);
  return { assets };
}

export function useInventory() {
  const inventory = useOpsStore((s) => s.inventory);
  return { inventory };
}

/** Brief loading window so skeleton loaders are exercisable on real routes. */
export function useSimulatedLoading(delayMs = 250): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);
  return loading;
}

export function useAssetLookup() {
  const { assets } = useAssets();
  return useMemo(() => {
    const byId = new Map(assets.map((a) => [a.id, a]));
    const byTag = new Map(assets.map((a) => [a.tag, a]));
    return {
      assetById: (id: string | null) => (id ? (byId.get(id) ?? null) : null),
      assetByTag: (tag: string) => byTag.get(tag) ?? null,
    };
  }, [assets]);
}

export function useVendors() {
  const { data, error, isLoading } = useSWR("vendors", vendorFetcher, {
    fallbackData: VENDORS,
  });
  return { vendors: data ?? VENDORS, error, isLoading };
}

export function useTechnicians() {
  return { technicians: TECHNICIANS };
}

export function useTechnicianLookup() {
  const { technicians } = useTechnicians();
  return useMemo(() => {
    const byId = new Map(technicians.map((t) => [t.id, t]));
    return {
      technicianById: (id: string | null) => (id ? (byId.get(id) ?? null) : null),
      technicianName: (id: string | null) =>
        id ? (byId.get(id)?.name ?? "Unassigned") : "Unassigned",
    };
  }, [technicians]);
}

export function useVendorLookup() {
  const { vendors } = useVendors();
  return useMemo(() => {
    const byId = new Map(vendors.map((v) => [v.id, v]));
    return {
      vendorById: (id: string | null) => (id ? (byId.get(id) ?? null) : null),
      vendorName: (id: string | null) => (id ? (byId.get(id)?.name ?? null) : null),
    };
  }, [vendors]);
}

/** Live clock for SLA countdowns; ticks on an interval once mounted. */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function useOpsMetrics() {
  const { workOrders } = useWorkOrders();

  return useMemo(() => {
    const active = workOrders.filter((wo) => wo.status !== "completed" && wo.status !== "verified");
    const now = Date.now();
    const overdue = active.filter((wo) => new Date(wo.dueAt).getTime() < now);
    const critical = active.filter((wo) => wo.priority === "critical");
    return { active, overdue, critical };
  }, [workOrders]);
}

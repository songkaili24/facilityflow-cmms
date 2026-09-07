import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useOpsMetrics, useSimulatedLoading, useTechnicianLookup } from "@/lib/hooks";
import { useOpsStore } from "@/lib/store";
import type { WorkOrder } from "@/lib/types";

beforeEach(() => {
  useOpsStore.setState(useOpsStore.getInitialState(), true);
});

describe("useOpsMetrics", () => {
  it("counts active, overdue, and critical work orders", () => {
    const { result } = renderHook(() => useOpsMetrics());
    const { active, critical } = result.current;

    const expectedActive = useOpsStore
      .getState()
      .workOrders.filter((w) => w.status !== "completed" && w.status !== "verified").length;
    expect(active).toHaveLength(expectedActive);
    expect(critical.length).toBeGreaterThan(0);
    expect(critical.every((w) => w.priority === "critical")).toBe(true);
  });

  it("flags work orders whose SLA deadline has passed", () => {
    // Seed a synthetic breached order (fixtures are all within SLA).
    const breached: WorkOrder = {
      ...useOpsStore.getState().workOrders[0],
      id: "wo-breach",
      number: "WO-BREACH",
      dueAt: new Date(Date.now() - 3_600_000).toISOString(),
    };
    useOpsStore.setState({ workOrders: [breached] });

    const { result } = renderHook(() => useOpsMetrics());
    expect(result.current.overdue.map((w) => w.id)).toEqual(["wo-breach"]);
  });

  it("excludes completed and verified orders from active", () => {
    useOpsStore.getState().setStatus("wo-2106", "completed");
    const { active } = renderHook(() => useOpsMetrics()).result.current;
    expect(active.some((w) => w.id === "wo-2106")).toBe(false);
  });
});

describe("useTechnicianLookup", () => {
  it("resolves names and falls back to Unassigned", () => {
    const { result } = renderHook(() => useTechnicianLookup());
    expect(result.current.technicianName("tech-shah")).toBe("Priya Shah");
    expect(result.current.technicianName(null)).toBe("Unassigned");
    expect(result.current.technicianName("tech-nobody")).toBe("Unassigned");
  });
});

describe("useSimulatedLoading", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts true and flips false after the delay", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useSimulatedLoading(300));
    expect(result.current).toBe(true);
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(result.current).toBe(false);
  });
});

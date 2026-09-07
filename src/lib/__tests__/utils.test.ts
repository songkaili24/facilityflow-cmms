import { describe, expect, it } from "vitest";
import {
  cn,
  formatDuration,
  formatLocation,
  formatMoney,
  formatRelative,
  initials,
  warrantyStatus,
} from "@/lib/utils";
import { stockStatusOf } from "@/lib/types";

describe("cn", () => {
  it("merges classes and resolves tailwind conflicts", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("p-2", false && "p-4", "mt-1")).toBe("p-2 mt-1");
  });
});

describe("initials", () => {
  it("takes first letters of up to two words", () => {
    expect(initials("Dana Reyes")).toBe("DR");
    expect(initials("Marcus Webb")).toBe("MW");
  });
  it("handles single names and extra whitespace", () => {
    expect(initials("Cher")).toBe("C");
    expect(initials("  Ada   Lovelace  ")).toBe("AL");
  });
});

describe("formatMoney", () => {
  it("formats USD without cents", () => {
    expect(formatMoney(148)).toBe("$148");
    expect(formatMoney(1234)).toBe("$1,234");
  });
  it("rounds fractional amounts to whole dollars", () => {
    expect(formatMoney(12.5)).toBe("$13");
    expect(formatMoney(1.4)).toBe("$1");
  });
});

describe("formatRelative", () => {
  const now = new Date("2026-09-08T12:00:00Z").getTime();

  it("renders past offsets with ago", () => {
    expect(formatRelative(new Date(now - 30_000).toISOString(), now)).toBe("just now");
    expect(formatRelative(new Date(now - 10 * 60_000).toISOString(), now)).toBe("10m ago");
    expect(formatRelative(new Date(now - 3 * 3_600_000).toISOString(), now)).toBe("3h ago");
    expect(formatRelative(new Date(now - 2 * 86_400_000).toISOString(), now)).toBe("2d ago");
  });

  it("renders future offsets with in", () => {
    expect(formatRelative(new Date(now + 45 * 60_000).toISOString(), now)).toBe("in 45m");
    expect(formatRelative(new Date(now + 5 * 3_600_000).toISOString(), now)).toBe("in 5h");
    expect(formatRelative(new Date(now + 6 * 86_400_000).toISOString(), now)).toBe("in 6d");
  });
});

describe("formatDuration", () => {
  it("formats minutes, hours, and multi-day durations", () => {
    expect(formatDuration(59 * 60_000)).toBe("59m");
    expect(formatDuration(3 * 3_600_000 + 5 * 60_000)).toBe("3h 05m");
    expect(formatDuration(2 * 86_400_000 + 5 * 3_600_000)).toBe("2d 5h");
  });
  it("clamps negative durations to zero", () => {
    expect(formatDuration(-5_000)).toBe("0m");
  });
});

describe("formatLocation", () => {
  it("joins building, floor, zone, and room", () => {
    expect(
      formatLocation({
        building: "Building A",
        floor: "3",
        zone: "Zone 2 — Core",
        room: "312",
      })
    ).toBe("Building A · Fl 3 · Zone 2 · Rm 312");
  });
  it("omits zone/room when missing and passes Roof through", () => {
    expect(formatLocation({ building: "Building B", floor: "Roof" })).toBe("Building B · Roof");
  });
});

describe("warrantyStatus", () => {
  const now = new Date("2026-09-08T12:00:00Z").getTime();

  it("returns None for missing warranty", () => {
    expect(warrantyStatus(null, now)).toBe("None");
  });
  it("classifies active, expiring (<=90d), and expired", () => {
    expect(warrantyStatus(new Date(now + 200 * 86_400_000).toISOString(), now)).toBe("Active");
    expect(warrantyStatus(new Date(now + 30 * 86_400_000).toISOString(), now)).toBe("Expiring");
    expect(warrantyStatus(new Date(now - 1 * 86_400_000).toISOString(), now)).toBe("Expired");
  });
});

describe("stockStatusOf", () => {
  const base = {
    id: "inv-1",
    sku: "SKU-1",
    name: "Test part",
    category: "HVAC",
    unit: "ea",
    unitCost: 10,
    supplierId: "ven-1",
    location: "Storeroom A",
    updatedAt: "2026-09-01T00:00:00Z",
  };

  it("classifies in stock above the reorder threshold", () => {
    expect(stockStatusOf({ ...base, quantity: 25, reorderThreshold: 24 })).toBe("in_stock");
  });
  it("treats at-threshold as low stock (boundary)", () => {
    expect(stockStatusOf({ ...base, quantity: 24, reorderThreshold: 24 })).toBe("low_stock");
  });
  it("treats zero as out of stock", () => {
    expect(stockStatusOf({ ...base, quantity: 0, reorderThreshold: 4 })).toBe("out_of_stock");
  });
});

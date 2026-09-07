import { describe, expect, it } from "vitest";
import { KANBAN_COLUMNS, SPECIALTY_CATEGORIES, STATUS_META } from "@/lib/statuses";
import type { VendorSpecialty, WorkOrderStatus } from "@/lib/types";

describe("KANBAN_COLUMNS", () => {
  it("exposes the five required dispatch columns", () => {
    expect(KANBAN_COLUMNS.map((c) => c.status)).toEqual([
      "reported",
      "assigned",
      "in_progress",
      "awaiting_parts",
      "completed",
    ]);
    expect(KANBAN_COLUMNS.map((c) => c.label)).toEqual([
      "New",
      "Assigned",
      "In Progress",
      "Awaiting Parts",
      "Completed",
    ]);
  });
});

describe("STATUS_META", () => {
  it("labels verified work orders distinctly from completed", () => {
    expect(STATUS_META.completed.label).toBe("Completed");
    expect(STATUS_META.verified.label).toBe("Verified");
  });
});

describe("SPECIALTY_CATEGORIES", () => {
  it("covers every vendor specialty", () => {
    const specialties: VendorSpecialty[] = [
      "HVAC",
      "Electrical",
      "Plumbing",
      "Elevator",
      "Fire Safety",
      "Landscaping",
    ];
    for (const specialty of specialties) {
      expect(SPECIALTY_CATEGORIES[specialty]).toBeDefined();
    }
  });
});

describe("status display labels", () => {
  it("never returns empty labels for valid statuses", () => {
    for (const status of Object.keys(STATUS_META) as WorkOrderStatus[]) {
      expect(STATUS_META[status].label.length).toBeGreaterThan(0);
    }
  });
});

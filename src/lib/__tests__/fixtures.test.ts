import { describe, expect, it } from "vitest";
import { ASSETS, INVENTORY, PM_TASKS, TECHNICIANS, VENDORS, WORK_ORDERS } from "@/lib/fixtures";
import { KANBAN_COLUMNS, PRIORITY_META, SPECIALTY_CATEGORIES, STATUS_META } from "@/lib/statuses";
import {
  BUILDINGS,
  FLOORS_BY_BUILDING,
  PM_FREQUENCIES,
  WORK_ORDER_CATEGORIES,
  ZONES,
} from "@/lib/types";

describe("work order fixtures", () => {
  it("have unique ids and numbers", () => {
    const ids = WORK_ORDERS.map((w) => w.id);
    const numbers = WORK_ORDERS.map((w) => w.number);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(numbers).size).toBe(numbers.length);
  });

  it("only use known statuses, priorities, and categories", () => {
    for (const wo of WORK_ORDERS) {
      expect(STATUS_META[wo.status]).toBeDefined();
      expect(PRIORITY_META[wo.priority]).toBeDefined();
      expect(WORK_ORDER_CATEGORIES).toContain(wo.category);
      expect(KANBAN_COLUMNS.some((c) => c.status === wo.status) || wo.status === "verified").toBe(
        true
      );
    }
  });

  it("reference existing assets, vendors, and technicians", () => {
    const assetIds = new Set(ASSETS.map((a) => a.id));
    const vendorIds = new Set(VENDORS.map((v) => v.id));
    const techIds = new Set(TECHNICIANS.map((t) => t.id));
    for (const wo of WORK_ORDERS) {
      if (wo.assetId) expect(assetIds.has(wo.assetId), `${wo.number} assetId`).toBe(true);
      if (wo.vendorId) expect(vendorIds.has(wo.vendorId), `${wo.number} vendorId`).toBe(true);
      if (wo.assigneeId) expect(techIds.has(wo.assigneeId), `${wo.number} assigneeId`).toBe(true);
    }
  });

  it("have due dates after their reported time", () => {
    for (const wo of WORK_ORDERS) {
      expect(
        new Date(wo.dueAt).getTime(),
        `${wo.number} dueAt must be after reportedAt`
      ).toBeGreaterThan(new Date(wo.reportedAt).getTime());
    }
  });

  it("have unique part line ids within each order", () => {
    for (const wo of WORK_ORDERS) {
      const ids = wo.parts.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const part of wo.parts) {
        expect(part.qty).toBeGreaterThan(0);
        expect(part.unitCost).toBeGreaterThanOrEqual(0);
      }
    }
  });

  // BUG DEMONSTRATION: WO-2109 references floor "5" in Building B, but the
  // location taxonomy for Building B is [Basement (B1), 1, 4, Roof] — the
  // cascading location picker cannot produce that location.
  it.fails("only reference locations the cascading picker can produce", () => {
    for (const wo of WORK_ORDERS) {
      expect(
        FLOORS_BY_BUILDING[wo.location.building],
        `${wo.number} building exists in taxonomy`
      ).toBeDefined();
      expect(FLOORS_BY_BUILDING[wo.location.building], `${wo.number} floor`).toContain(
        wo.location.floor
      );
    }
  });
});

describe("asset fixtures", () => {
  it("have unique ids and tags", () => {
    expect(new Set(ASSETS.map((a) => a.id)).size).toBe(ASSETS.length);
    expect(new Set(ASSETS.map((a) => a.tag)).size).toBe(ASSETS.length);
  });

  it("use valid categories and buildings from the taxonomy", () => {
    for (const asset of ASSETS) {
      expect(WORK_ORDER_CATEGORIES).toContain(asset.category);
      expect(BUILDINGS).toContain(asset.location.building);
    }
  });
});

describe("vendor fixtures", () => {
  it("have unique ids, names, and rating values in range", () => {
    expect(new Set(VENDORS.map((v) => v.id)).size).toBe(VENDORS.length);
    expect(new Set(VENDORS.map((v) => v.name)).size).toBe(VENDORS.length);
    for (const vendor of VENDORS) {
      expect(vendor.rating).toBeGreaterThanOrEqual(0);
      expect(vendor.rating).toBeLessThanOrEqual(5);
    }
  });
});

describe("PM task fixtures", () => {
  it("reference existing assets and technicians", () => {
    const assetIds = new Set(ASSETS.map((a) => a.id));
    const techIds = new Set(TECHNICIANS.map((t) => t.id));
    const vendorIds = new Set(VENDORS.map((v) => v.id));
    for (const task of PM_TASKS) {
      expect(assetIds.has(task.assetId), `${task.number} assetId`).toBe(true);
      if (task.assignedTechId) expect(techIds.has(task.assignedTechId)).toBe(true);
      if (task.vendorId) expect(vendorIds.has(task.vendorId)).toBe(true);
    }
  });

  it("use known frequencies and have unique numbers", () => {
    const numbers = PM_TASKS.map((t) => t.number);
    expect(new Set(numbers).size).toBe(numbers.length);
    for (const task of PM_TASKS) {
      expect(PM_FREQUENCIES).toContain(task.frequency);
    }
  });
});

describe("inventory fixtures", () => {
  it("have unique skus and reference real suppliers", () => {
    expect(new Set(INVENTORY.map((i) => i.sku)).size).toBe(INVENTORY.length);
    const vendorIds = new Set(VENDORS.map((v) => v.id));
    for (const item of INVENTORY) {
      expect(vendorIds.has(item.supplierId), `${item.sku} supplierId`).toBe(true);
      expect(item.reorderThreshold).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("technician fixtures", () => {
  it("have unique ids and valid certifications", () => {
    expect(new Set(TECHNICIANS.map((t) => t.id)).size).toBe(TECHNICIANS.length);
    for (const tech of TECHNICIANS) {
      expect(tech.certifications.length).toBeGreaterThan(0);
      for (const cert of tech.certifications) {
        expect(cert.name).toBeTruthy();
        expect(cert.number).toBeTruthy();
      }
    }
  });
});

describe("status metadata completeness", () => {
  it("covers every status and priority used by the domain", () => {
    for (const status of [
      "reported",
      "assigned",
      "in_progress",
      "awaiting_parts",
      "completed",
      "verified",
    ] as const) {
      expect(STATUS_META[status]).toBeDefined();
    }
    const ranks = Object.values(PRIORITY_META).map((m) => m.rank);
    expect(new Set(ranks).size).toBe(ranks.length);
  });

  it("maps every vendor specialty to at least one category", () => {
    for (const vendor of VENDORS) {
      expect(SPECIALTY_CATEGORIES[vendor.specialty]).toBeDefined();
    }
  });
});

describe("location taxonomy", () => {
  it("uses consistent zone names across the domain", () => {
    for (const wo of WORK_ORDERS) {
      if (wo.location.zone) expect(ZONES).toContain(wo.location.zone);
    }
  });
});

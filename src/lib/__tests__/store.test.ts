import { beforeEach, describe, expect, it } from "vitest";
import { useOpsStore, filterWorkOrders } from "@/lib/store";
import { TECHNICIANS, VENDORS, WORK_ORDERS } from "@/lib/fixtures";
import { STATUS_META } from "@/lib/statuses";
import type { WorkOrder } from "@/lib/types";

const techNameFor = (id: string | null) =>
  TECHNICIANS.find((t) => t.id === id)?.name ?? "Unassigned";

beforeEach(() => {
  useOpsStore.setState(useOpsStore.getInitialState(), true);
});

describe("initial state", () => {
  it("seeds work orders from fixtures", () => {
    expect(useOpsStore.getState().workOrders).toHaveLength(WORK_ORDERS.length);
  });
});

describe("filterWorkOrders", () => {
  const wo = (partial: Partial<WorkOrder>): WorkOrder => ({
    id: "wo-x",
    number: "WO-9999",
    title: "Test",
    description: "",
    status: "reported",
    priority: "medium",
    category: "HVAC",
    location: { building: "Building A", floor: "1" },
    assetId: null,
    reportedBy: "Test",
    reportedAt: "2026-09-08T10:00:00Z",
    dueAt: "2026-09-09T10:00:00Z",
    assigneeId: null,
    vendorId: null,
    isEmergency: false,
    parts: [],
    timeline: [],
    photos: [],
    completedAt: null,
    ...partial,
  });

  it("returns everything for empty filters, newest first", () => {
    const list = [
      wo({ id: "a", reportedAt: "2026-09-01T00:00:00Z" }),
      wo({ id: "b", reportedAt: "2026-09-05T00:00:00Z" }),
    ];
    const result = filterWorkOrders(
      list,
      { query: "", priorities: [], categories: [], statuses: [], assignees: [] },
      techNameFor
    );
    expect(result.map((r) => r.id)).toEqual(["b", "a"]);
  });

  it("searches across number, title, and location fields", () => {
    const list = [
      wo({ id: "num", number: "WO-2042", title: "Unrelated" }),
      wo({ id: "title", number: "WO-0001", title: "Chiller 2 trip" }),
      wo({
        id: "loc",
        number: "WO-0002",
        title: "Unrelated",
        location: { building: "Tower East", floor: "2", zone: "Zone 9 — Docks", room: "204" },
      }),
    ];
    const base = { priorities: [], categories: [], statuses: [], assignees: [] };
    expect(
      filterWorkOrders(list, { ...base, query: "wo-2042" }, techNameFor).map((r) => r.id)
    ).toEqual(["num"]);
    expect(
      filterWorkOrders(list, { ...base, query: "chiller" }, techNameFor).map((r) => r.id)
    ).toEqual(["title"]);
    expect(
      filterWorkOrders(list, { ...base, query: "zone 9" }, techNameFor).map((r) => r.id)
    ).toEqual(["loc"]);
    expect(filterWorkOrders(list, { ...base, query: "nomatch" }, techNameFor)).toHaveLength(0);
  });

  it("filters by priority, category, and status facets", () => {
    const list = [
      wo({ id: "crit", priority: "critical" }),
      wo({ id: "low", priority: "low", category: "Plumbing", status: "completed" }),
    ];
    const base = { query: "", assignees: [] };
    const run = (filters: Partial<Parameters<typeof filterWorkOrders>[1]>) =>
      filterWorkOrders(
        list,
        { query: "", priorities: [], categories: [], statuses: [], assignees: [], ...filters },
        techNameFor
      );

    expect(run({ priorities: ["critical"] }).map((r) => r.id)).toEqual(["crit"]);
    expect(run({ categories: ["Plumbing"] }).map((r) => r.id)).toEqual(["low"]);
    expect(run({ statuses: ["completed"] }).map((r) => r.id)).toEqual(["low"]);
  });

  it("filters by in-house assignee id and name", () => {
    const list = [
      wo({ id: "shah", assigneeId: "tech-shah" }),
      wo({ id: "none", assigneeId: null }),
    ];
    const base = { query: "", priorities: [], categories: [], statuses: [] };
    expect(
      filterWorkOrders(list, { ...base, assignees: ["tech-shah"] }, techNameFor).map((r) => r.id)
    ).toEqual(["shah"]);
    expect(
      filterWorkOrders(list, { ...base, assignees: ["Unassigned"] }, techNameFor).map((r) => r.id)
    ).toEqual(["none"]);
  });

  // BUG DEMONSTRATION: filterWorkOrders only matches assigneeId / technician
  // name, but vendor-assigned work orders carry vendorId — so choosing a
  // vendor in the assignee filter silently returns nothing.
  it.fails("matches vendor-assigned work orders when filtering by vendor", () => {
    const vendor = VENDORS[0];
    const list = [wo({ id: "vendored", assigneeId: null, vendorId: vendor.id })];
    const result = filterWorkOrders(
      list,
      { query: "", priorities: [], categories: [], statuses: [], assignees: [vendor.id] },
      techNameFor
    );
    expect(result.map((r) => r.id)).toEqual(["vendored"]);
  });
});

describe("createWorkOrder", () => {
  it("creates a reported work order with a generated number and audit timeline", () => {
    const before = useOpsStore.getState().workOrders.length;
    const created = useOpsStore.getState().createWorkOrder({
      title: "Lobby door closer replacement",
      category: "General",
      priority: "medium",
      location: { building: "Building A", floor: "1", zone: "Zone 2 — Core", room: "LOBBY-A" },
      description: "Hydraulic closer leaking; door slams. Parts on order.",
      assigneeId: "tech-ellis",
      dueAt: "2026-09-10T12:00:00Z",
      photoCount: 0,
    });

    expect(created.status).toBe("reported");
    expect(created.number).toMatch(/^WO-\d{4}$/);
    expect(created.isEmergency).toBe(false);
    expect(created.timeline.some((t) => t.type === "status")).toBe(true);
    expect(created.timeline.some((t) => t.type === "assignment")).toBe(true);
    expect(useOpsStore.getState().workOrders).toHaveLength(before + 1);
    expect(useOpsStore.getState().pendingSync[created.id]).toBeTypeOf("number");
  });

  it("flags emergency only for critical priority and skips assignment entry when unassigned", () => {
    const created = useOpsStore.getState().createWorkOrder({
      title: "Flooding in pump room",
      category: "Plumbing",
      priority: "critical",
      location: { building: "Building B", floor: "Basement (B1)" },
      description: "Active water intrusion at pump room floor drain.",
      assigneeId: null,
      dueAt: "2026-09-08T20:00:00Z",
      photoCount: 2,
    });
    expect(created.isEmergency).toBe(true);
    expect(created.timeline.filter((t) => t.type === "assignment")).toHaveLength(0);
    expect(created.photos).toHaveLength(2);
  });

  // BUG DEMONSTRATION: the id/number sequence starts at 2101, which collides
  // with fixture work order wo-2101 / WO-2101 — duplicate ids break store
  // lookups, detail routes, and React keys.
  it.fails("never generates an id/number that already exists", () => {
    const existing = new Set(useOpsStore.getState().workOrders.map((w) => w.id));
    const created = useOpsStore.getState().createWorkOrder({
      title: "Sequence collision probe",
      category: "General",
      priority: "low",
      location: { building: "Building A", floor: "1" },
      description: "Probe for id uniqueness against seeded fixtures.",
      assigneeId: null,
      dueAt: "2026-09-10T12:00:00Z",
      photoCount: 0,
    });
    expect(existing.has(created.id)).toBe(false);
    expect(
      useOpsStore.getState().workOrders.filter((w) => w.number === created.number)
    ).toHaveLength(1);
  });

  // BUG DEMONSTRATION: createWorkOrder writes the raw status key
  // ("reported") into the timeline while setStatus writes display labels
  // ("New Request") — the audit trail renders inconsistently.
  it.fails("labels the created status entry consistently with later transitions", () => {
    const created = useOpsStore.getState().createWorkOrder({
      title: "Timeline label consistency probe",
      category: "General",
      priority: "low",
      location: { building: "Building A", floor: "1" },
      description: "Probe for consistent status labels in the audit timeline.",
      assigneeId: null,
      dueAt: "2026-09-10T12:00:00Z",
      photoCount: 0,
    });
    expect(created.timeline[0].to).toBe(STATUS_META.reported.label);
  });
});

describe("setStatus", () => {
  it("transitions status and appends a from/to timeline entry", () => {
    const id = "wo-2106";
    const before = useOpsStore.getState().workOrders.find((w) => w.id === id)!;
    useOpsStore.getState().setStatus(id, "assigned");
    const after = useOpsStore.getState().workOrders.find((w) => w.id === id)!;

    expect(after.status).toBe("assigned");
    const entry = after.timeline.at(-1)!;
    expect(entry.type).toBe("status");
    expect(entry.from).toBe(STATUS_META.reported.label);
    expect(entry.to).toBe(STATUS_META.assigned.label);
    expect(after.timeline.length).toBe(before.timeline.length + 1);
  });

  it("stamps completedAt when completed and keeps it on verified", () => {
    useOpsStore.getState().setStatus("wo-2101", "completed");
    const completed = useOpsStore.getState().workOrders.find((w) => w.id === "wo-2101")!;
    expect(completed.completedAt).toBeTypeOf("string");

    useOpsStore.getState().setStatus("wo-2101", "verified");
    const verified = useOpsStore.getState().workOrders.find((w) => w.id === "wo-2101")!;
    expect(verified.status).toBe("verified");
    expect(verified.completedAt).toBe(completed.completedAt);
  });

  it("is a no-op (no duplicate timeline entry) when status is unchanged", () => {
    const before = useOpsStore.getState().workOrders.find((w) => w.id === "wo-2101")!;
    useOpsStore.getState().setStatus("wo-2101", before.status);
    const after = useOpsStore.getState().workOrders.find((w) => w.id === "wo-2101")!;
    expect(after.timeline.length).toBe(before.timeline.length);
  });

  it("ignores unknown ids without corrupting state", () => {
    const before = useOpsStore.getState().workOrders;
    useOpsStore.getState().setStatus("wo-does-not-exist", "assigned");
    expect(useOpsStore.getState().workOrders).toEqual(before);
  });
});

describe("addComment / attachPhotos", () => {
  it("appends comments and photo records to the timeline", () => {
    const id = "wo-2103";
    useOpsStore.getState().addComment(id, "Seal kit staged at pump room.");
    useOpsStore.getState().attachPhotos(id, 2, "Before photos");

    const wo = useOpsStore.getState().workOrders.find((w) => w.id === id)!;
    expect(wo.timeline.at(-2)!.type).toBe("comment");
    expect(wo.timeline.at(-2)!.message).toBe("Seal kit staged at pump room.");
    expect(wo.timeline.at(-1)!.type).toBe("photo");
    expect(wo.timeline.at(-1)!.photoCount).toBe(2);
    expect(wo.photos).toHaveLength(2);
  });
});

describe("togglePart", () => {
  it("cycles a part between on-hand and ordered", () => {
    const woId = "wo-2101";
    const partId = useOpsStore.getState().workOrders.find((w) => w.id === woId)!.parts[0].id;

    useOpsStore.getState().togglePart(woId, partId);
    expect(
      useOpsStore
        .getState()
        .workOrders.find((w) => w.id === woId)!
        .parts.find((p) => p.id === partId)!.status
    ).toBe("ordered");

    useOpsStore.getState().togglePart(woId, partId);
    expect(
      useOpsStore
        .getState()
        .workOrders.find((w) => w.id === woId)!
        .parts.find((p) => p.id === partId)!.status
    ).toBe("on_hand");
  });
});

describe("escalate", () => {
  it("raises priority to critical, flags emergency, and logs the escalation", () => {
    useOpsStore.getState().escalate("wo-2107");
    const wo = useOpsStore.getState().workOrders.find((w) => w.id === "wo-2107")!;
    expect(wo.priority).toBe("critical");
    expect(wo.isEmergency).toBe(true);
    expect(wo.timeline.at(-1)!.message).toContain("Escalated");
  });
});

describe("dispatchVendor", () => {
  it("assigns the vendor and promotes reported work orders to assigned", () => {
    useOpsStore.getState().dispatchVendor("wo-2106", "ven-apex");
    const wo = useOpsStore.getState().workOrders.find((w) => w.id === "wo-2106")!;
    expect(wo.vendorId).toBe("ven-apex");
    expect(wo.status).toBe("assigned");
    expect(wo.timeline.some((t) => t.type === "assignment")).toBe(true);
  });
});

describe("requisitionPart", () => {
  it("debits on-hand stock for a valid requisition", () => {
    const result = useOpsStore.getState().requisitionPart("inv-003", 3, "WO-2101 bearings");
    expect(result.ok).toBe(true);
    const item = useOpsStore.getState().inventory.find((i) => i.id === "inv-003")!;
    expect(item.quantity).toBe(9); // 12 - 3
  });

  it("rejects zero and negative quantities", () => {
    expect(useOpsStore.getState().requisitionPart("inv-003", 0, "")).toMatchObject({ ok: false });
    expect(useOpsStore.getState().requisitionPart("inv-003", -2, "")).toMatchObject({ ok: false });
  });

  it("rejects unknown part ids", () => {
    expect(useOpsStore.getState().requisitionPart("inv-nope", 1, "")).toMatchObject({ ok: false });
  });

  // BUG DEMONSTRATION: requisitionPart validates against the static
  // INVENTORY fixture instead of the live store inventory, so repeated
  // requisitions can overdraw stock below zero.
  it.fails("validates against current on-hand stock, not the original fixture", () => {
    // inv-002 holds exactly 1 kit.
    const first = useOpsStore.getState().requisitionPart("inv-002", 1, "WO-2103 seal swap");
    expect(first.ok).toBe(true);

    // Store now shows 0 on hand — a second requisition must be rejected.
    const second = useOpsStore.getState().requisitionPart("inv-002", 1, "Duplicate draw");
    expect(second.ok).toBe(false);
    expect(useOpsStore.getState().inventory.find((i) => i.id === "inv-002")!.quantity).toBe(0);
  });
});

describe("schedulePm / completePm", () => {
  it("schedules a numbered PM task with empty history", () => {
    const task = useOpsStore.getState().schedulePm({
      title: "Chiller oil analysis",
      taskType: "Oil sample",
      frequency: "Quarterly",
      assetId: "ast-ch01",
      assignedTechId: "tech-webb",
      nextDue: "2026-12-01T08:00:00Z",
      estHours: 2,
    });
    expect(task.number).toMatch(/^PM-\d+$/);
    expect(task.history).toHaveLength(0);
    expect(useOpsStore.getState().pmTasks.some((t) => t.id === task.id)).toBe(true);
  });

  it("appends a completion record on completePm", () => {
    const before = useOpsStore.getState().pmTasks.find((t) => t.id === "pm-101")!.history.length;
    useOpsStore.getState().completePm("pm-101", "Biocide dosed; TDS normal.");
    const after = useOpsStore.getState().pmTasks.find((t) => t.id === "pm-101")!;
    expect(after.history).toHaveLength(before + 1);
    expect(after.history.at(-1)!.completedBy).toBe("Dana Reyes");
    expect(after.history.at(-1)!.notes).toBe("Biocide dosed; TDS normal.");
  });
});

describe("addAsset", () => {
  it("registers an asset with a generated id", () => {
    const created = useOpsStore.getState().addAsset({
      tag: "AHU-07",
      name: "Air handling unit 7",
      category: "HVAC",
      location: { building: "Building A", floor: "7" },
      manufacturer: "Trane",
      model: "Unitary",
      installedAt: "2020-01-01",
      warrantyEnds: null,
      lastServiceAt: null,
      criticality: "medium",
    });
    expect(created.id).toBeTypeOf("string");
    expect(useOpsStore.getState().assets.some((a) => a.id === created.id)).toBe(true);
  });
});

describe("SLA policy + offline simulation state", () => {
  it("persists an admin-edited SLA policy", () => {
    const policy = useOpsStore.getState().slaPolicy ?? {
      critical: { responseHours: 0.5, arrivalHours: 4, resolutionHours: 8 },
      high: { responseHours: 1, arrivalHours: 8, resolutionHours: 24 },
      medium: { responseHours: 4, arrivalHours: 24, resolutionHours: 72 },
      low: { responseHours: 8, arrivalHours: 72, resolutionHours: 168 },
    };
    const edited = { ...policy, critical: { ...policy.critical, resolutionHours: 6 } };
    useOpsStore.getState().updateSlaPolicy(edited);
    expect(useOpsStore.getState().slaPolicy?.critical.resolutionHours).toBe(6);
  });

  it("toggles offline simulation", () => {
    expect(useOpsStore.getState().offlineSimulated).toBe(false);
    useOpsStore.getState().toggleOfflineSimulated();
    expect(useOpsStore.getState().offlineSimulated).toBe(true);
  });
});

describe("markSynced", () => {
  it("clears the pendingSync flag for a work order", () => {
    useOpsStore.getState().setStatus("wo-2101", "assigned");
    expect(useOpsStore.getState().pendingSync["wo-2101"]).toBeTypeOf("number");
    useOpsStore.getState().markSynced("wo-2101");
    expect(useOpsStore.getState().pendingSync["wo-2101"]).toBeUndefined();
  });
});

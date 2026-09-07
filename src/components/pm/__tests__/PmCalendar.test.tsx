import { describe, expect, it } from "vitest";
import { buildMonth, daysOverdue, isOverdue, type PmCalendarDay } from "@/components/pm/PmCalendar";
import type { PmTask } from "@/lib/types";

const NOW = new Date("2026-09-08T12:00:00Z").getTime();

function task(partial: Partial<PmTask>): PmTask {
  return {
    id: "pm-x",
    number: "PM-999",
    title: "Test PM",
    taskType: "Inspection",
    frequency: "Monthly",
    assetId: "ast-ahu03",
    assignedTechId: null,
    vendorId: null,
    nextDue: "2026-09-15T08:00:00Z",
    estHours: 2,
    history: [],
    ...partial,
  };
}

describe("isOverdue / daysOverdue", () => {
  it("flags past-due tasks and counts whole days", () => {
    expect(isOverdue(task({ nextDue: "2026-09-08T00:00:00Z" }), NOW)).toBe(true);
    expect(daysOverdue(task({ nextDue: "2026-09-06T00:00:00Z" }), NOW)).toBe(2);
  });
  it("treats future tasks as not overdue", () => {
    expect(isOverdue(task({ nextDue: "2026-09-20T00:00:00Z" }), NOW)).toBe(false);
    expect(daysOverdue(task({ nextDue: "2026-09-20T00:00:00Z" }), NOW)).toBe(0);
  });
});

describe("buildMonth", () => {
  const anchor = new Date(2026, 8, 1); // September 2026

  it("lays out 6 weeks starting on Sunday", () => {
    const weeks = buildMonth(anchor, []);
    expect(weeks).toHaveLength(6);
    expect(weeks[0][0].date.getDay()).toBe(0);
  });

  it("places tasks on their due date and flags today", () => {
    const dueSoon = task({ id: "pm-a", nextDue: new Date(2026, 8, 15, 8).toISOString() });
    const today = new Date();
    const dueToday = task({
      id: "pm-b",
      nextDue: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8).toISOString(),
    });
    const weeks = buildMonth(anchor, [dueSoon, dueToday]);

    const all = weeks.flat() as PmCalendarDay[];
    const day15 = all.find((d) => d.date.getDate() === 15 && d.date.getMonth() === 8)!;
    expect(day15.tasks.some((t) => t.id === "pm-a")).toBe(true);
    expect(all.some((d) => d.isToday && d.tasks.some((t) => t.id === "pm-b"))).toBe(true);
  });

  it("spills adjacent-month days for complete weeks", () => {
    const weeks = buildMonth(anchor, []);
    expect(weeks[0].some((d) => !d.inMonth)).toBe(true);
    expect(weeks[5].some((d) => !d.inMonth)).toBe(true);
  });
});

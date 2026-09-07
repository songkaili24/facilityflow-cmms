import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SLA_HOURS, formatSlaHours, slaDueFrom, slaLabel } from "@/lib/sla";
import { DEFAULT_SLA_POLICY, type SlaPolicy } from "@/lib/types";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-08T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("DEFAULT_SLA_HOURS", () => {
  it("is monotonic: tighter priorities resolve sooner", () => {
    expect(DEFAULT_SLA_HOURS.critical).toBeLessThan(DEFAULT_SLA_HOURS.high);
    expect(DEFAULT_SLA_HOURS.high).toBeLessThan(DEFAULT_SLA_HOURS.medium);
    expect(DEFAULT_SLA_HOURS.medium).toBeLessThan(DEFAULT_SLA_HOURS.low);
  });
});

describe("slaDueFrom", () => {
  it("computes the deadline from the priority hours", () => {
    const due = slaDueFrom("high");
    expect(new Date(due).getTime()).toBe(
      new Date("2026-09-08T12:00:00Z").getTime() + DEFAULT_SLA_HOURS.high * 3_600_000
    );
  });

  it("honors a custom policy map (e.g. admin-edited SLA config)", () => {
    const policy = { critical: 2, high: 10, medium: 40, low: 80 };
    const due = slaDueFrom("critical", new Date(), policy);
    expect(new Date(due).getTime()).toBe(
      new Date("2026-09-08T12:00:00Z").getTime() + 2 * 3_600_000
    );
  });
});

describe("slaLabel", () => {
  it("renders day-based labels above 24h and hour labels below", () => {
    expect(slaLabel("low")).toBe("7-day SLA");
    expect(slaLabel("high")).toBe("1-day SLA");
    expect(slaLabel("medium")).toBe("3-day SLA");
    expect(slaLabel("critical")).toBe("8-hour SLA");
  });
});

describe("formatSlaHours", () => {
  it("formats sub-hour values as minutes", () => {
    expect(formatSlaHours(0.5)).toBe("30 min");
  });
  it("formats whole days and plain hours", () => {
    expect(formatSlaHours(24)).toBe("1 day");
    expect(formatSlaHours(72)).toBe("3 days");
    expect(formatSlaHours(8)).toBe("8 h");
    expect(formatSlaHours(30)).toBe("30 h");
  });
});

describe("DEFAULT_SLA_POLICY vs DEFAULT_SLA_HOURS", () => {
  it("keeps the resolution tier of the three-target policy aligned with the hours map", () => {
    const resolutions = Object.fromEntries(
      Object.entries(DEFAULT_SLA_POLICY).map(([k, v]) => [k, v.resolutionHours])
    ) as Record<keyof SlaPolicy, number>;
    expect(resolutions).toEqual(DEFAULT_SLA_HOURS);
  });
});

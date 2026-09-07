import type { WorkOrderPriority } from "./types";

/** Resolution hours by priority — the intake modal's due-date default. */
export const DEFAULT_SLA_HOURS: Record<WorkOrderPriority, number> = {
  critical: 8,
  high: 24,
  medium: 72,
  low: 168,
};

/** Hours map for due-date math (resolution hours by priority). */
export type SlaHoursMap = Record<WorkOrderPriority, number>;

/** Resolution deadline used by intake SLA auto-calculation. */
export function slaDueFrom(
  priority: WorkOrderPriority,
  from: Date = new Date(),
  policy?: SlaHoursMap
): string {
  const hours = (policy ?? DEFAULT_SLA_HOURS)[priority];
  return new Date(from.getTime() + hours * 3_600_000).toISOString();
}

export function slaLabel(priority: WorkOrderPriority, policy?: SlaHoursMap): string {
  const h = (policy ?? DEFAULT_SLA_HOURS)[priority];
  return h >= 24 ? `${h / 24}-day SLA` : `${h < 1 ? Math.round(h * 60) + "-min" : h + "-hour"} SLA`;
}

/** Formats an hour value for the config table (0.5 -> "30 min"). */
export function formatSlaHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours >= 24 && hours % 24 === 0) return `${hours / 24} day${hours > 24 ? "s" : ""}`;
  return `${hours} h`;
}

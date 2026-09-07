import type { WorkOrderPriority } from "./types";

/**
 * SLA policy: response/fix deadline by priority, in hours.
 * Critical = emergency response window; low = routine backlog.
 */
export const SLA_HOURS: Record<WorkOrderPriority, number> = {
  critical: 4,
  high: 24,
  medium: 72,
  low: 168,
};

export function slaDueFrom(priority: WorkOrderPriority, from: Date = new Date()): string {
  return new Date(from.getTime() + SLA_HOURS[priority] * 3_600_000).toISOString();
}

export function slaLabel(priority: WorkOrderPriority): string {
  const h = SLA_HOURS[priority];
  return h >= 24 ? `${h / 24}-day SLA` : `${h}-hour SLA`;
}

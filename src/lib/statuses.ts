import type { WorkOrderPriority, WorkOrderStatus } from "./types";

export const STATUS_ORDER: readonly WorkOrderStatus[] = [
  "new",
  "assigned",
  "in_progress",
  "on_hold",
  "completed",
] as const;

export const PRIORITY_ORDER: readonly WorkOrderPriority[] = [
  "critical",
  "high",
  "medium",
  "low",
] as const;

interface StatusMeta {
  label: string;
  shortLabel: string;
  dot: string;
  badgeVariant: "danger" | "warning" | "success" | "info" | "neutral";
}

export const STATUS_META: Record<WorkOrderStatus, StatusMeta> = {
  new: {
    label: "New Request",
    shortLabel: "New",
    dot: "bg-danger",
    badgeVariant: "danger",
  },
  assigned: {
    label: "Assigned",
    shortLabel: "Assigned",
    dot: "bg-info",
    badgeVariant: "info",
  },
  in_progress: {
    label: "In Progress",
    shortLabel: "In Progress",
    dot: "bg-warning",
    badgeVariant: "warning",
  },
  on_hold: {
    label: "On Hold",
    shortLabel: "Hold",
    dot: "bg-charcoal-400",
    badgeVariant: "neutral",
  },
  completed: {
    label: "Completed",
    shortLabel: "Done",
    dot: "bg-success",
    badgeVariant: "success",
  },
};

interface PriorityMeta {
  label: string;
  badgeVariant: "critical" | "high" | "medium" | "low";
  rank: number;
}

export const PRIORITY_META: Record<WorkOrderPriority, PriorityMeta> = {
  critical: { label: "Critical", badgeVariant: "critical", rank: 0 },
  high: { label: "High", badgeVariant: "high", rank: 1 },
  medium: { label: "Medium", badgeVariant: "medium", rank: 2 },
  low: { label: "Low", badgeVariant: "low", rank: 3 },
};

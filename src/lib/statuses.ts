import type { WorkOrderPriority, WorkOrderStatus } from "./types";

/** Workflow order used by the detail-page stepper. */
export const STATUS_ORDER: readonly WorkOrderStatus[] = [
  "reported",
  "assigned",
  "in_progress",
  "completed",
  "verified",
] as const;

/** Kanban columns on the dispatch board. `verified` folds into Completed. */
export const KANBAN_COLUMNS: readonly { status: WorkOrderStatus; label: string }[] = [
  { status: "reported", label: "New" },
  { status: "assigned", label: "Assigned" },
  { status: "in_progress", label: "In Progress" },
  { status: "awaiting_parts", label: "Awaiting Parts" },
  { status: "completed", label: "Completed" },
] as const;

interface StatusMeta {
  label: string;
  dot: string;
  badgeVariant: "danger" | "warning" | "success" | "info" | "neutral";
}

export const STATUS_META: Record<WorkOrderStatus, StatusMeta> = {
  reported: { label: "New Request", dot: "bg-danger", badgeVariant: "danger" },
  assigned: { label: "Assigned", dot: "bg-info", badgeVariant: "info" },
  in_progress: { label: "In Progress", dot: "bg-warning", badgeVariant: "warning" },
  awaiting_parts: { label: "Awaiting Parts", dot: "bg-charcoal-400", badgeVariant: "neutral" },
  completed: { label: "Completed", dot: "bg-success", badgeVariant: "success" },
  verified: { label: "Verified", dot: "bg-success", badgeVariant: "success" },
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

/** Maps a vendor specialty to the work order categories it typically covers. */
export const SPECIALTY_CATEGORIES: Record<string, string[]> = {
  HVAC: ["HVAC"],
  Electrical: ["Electrical", "Security"],
  Plumbing: ["Plumbing"],
  Elevator: ["Other"],
  "Fire Safety": ["General"],
  Landscaping: ["Cleaning", "Other"],
};

/* Domain model for FacilityFlow. Aligned with common CMMS vocabulary. */

export type WorkOrderStatus = "new" | "assigned" | "in_progress" | "on_hold" | "completed";

export type WorkOrderPriority = "critical" | "high" | "medium" | "low";

export type WorkOrderCategory =
  | "HVAC"
  | "Electrical"
  | "Plumbing"
  | "Elevators"
  | "Fire & Life Safety"
  | "Janitorial"
  | "General";

export const WORK_ORDER_CATEGORIES: readonly WorkOrderCategory[] = [
  "HVAC",
  "Electrical",
  "Plumbing",
  "Elevators",
  "Fire & Life Safety",
  "Janitorial",
  "General",
] as const;

export type AssetCriticality = "critical" | "high" | "medium" | "low";

export interface WorkOrderNote {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  source: "typed" | "voice";
}

export interface WorkOrder {
  id: string;
  number: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  category: WorkOrderCategory;
  location: string;
  floor: string;
  assetTag: string | null;
  requestedBy: string;
  assignedVendor: string | null;
  assignedTechnician: string | null;
  createdAt: string;
  scheduledFor: string | null;
  completedAt: string | null;
  slaDueAt: string | null;
  isEmergency: boolean;
  checklist: WorkOrderChecklistItem[];
  notes: WorkOrderNote[];
}

export interface WorkOrderChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface PreventiveMaintenanceTask {
  id: string;
  number: string;
  title: string;
  assetTag: string;
  assetName: string;
  category: WorkOrderCategory;
  frequency: "Weekly" | "Monthly" | "Quarterly" | "Semi-Annual" | "Annual";
  nextDue: string;
  assignedVendor: string | null;
  estimatedHours: number;
  lastCompleted: string | null;
}

export interface Vendor {
  id: string;
  name: string;
  trades: WorkOrderCategory[];
  contactName: string;
  phone: string;
  email: string;
  rating: number;
  slaResponseHours: number;
  preferred: boolean;
  contractEnd: string;
}

export interface BuildingAsset {
  id: string;
  tag: string;
  name: string;
  category: WorkOrderCategory;
  location: string;
  floor: string;
  criticality: AssetCriticality;
  manufacturer: string;
  model: string;
  installedYear: number;
  warrantyEnds: string | null;
  lastServiceDate: string | null;
  openWorkOrderCount: number;
}

export interface ShiftSession {
  engineer: string;
  role: string;
  shift: "Day (07:00–15:30)" | "Swing (15:00–23:30)" | "Night (23:00–07:30)";
}

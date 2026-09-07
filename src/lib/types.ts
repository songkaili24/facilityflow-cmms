/* Domain model for FacilityFlow — v2 (structured locations, technicians,
   activity timelines, parts, and richer PM/vendor records). */

/* ------------------------------- taxonomy ------------------------------- */

export type WorkOrderCategory =
  "HVAC" | "Plumbing" | "Electrical" | "Structural" | "Cleaning" | "Security" | "General" | "Other";

export const WORK_ORDER_CATEGORIES: readonly WorkOrderCategory[] = [
  "HVAC",
  "Plumbing",
  "Electrical",
  "Structural",
  "Cleaning",
  "Security",
  "General",
  "Other",
] as const;

export type WorkOrderPriority = "critical" | "high" | "medium" | "low";

export type WorkOrderStatus =
  "reported" | "assigned" | "in_progress" | "awaiting_parts" | "completed" | "verified";

export type VendorSpecialty =
  "HVAC" | "Electrical" | "Plumbing" | "Elevator" | "Fire Safety" | "Landscaping";

export type PmFrequency = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Semi-Annual" | "Annual";

export const PM_FREQUENCIES: readonly PmFrequency[] = [
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
  "Semi-Annual",
  "Annual",
] as const;

export type AssetCriticality = "critical" | "high" | "medium" | "low";

export type WarrantyStatus = "Active" | "Expiring" | "Expired" | "None";

/* ------------------------------- location ------------------------------- */

export interface Location {
  building: string;
  floor: string;
  zone?: string;
  room?: string;
}

export const BUILDINGS: readonly string[] = ["Building A", "Building B", "Central Plant"] as const;

export const FLOORS_BY_BUILDING: Record<string, readonly string[]> = {
  "Building A": ["Basement (B1)", "1", "3", "5", "9", "12", "Roof"],
  "Building B": ["Basement (B1)", "1", "4", "Roof"],
  "Central Plant": ["Basement (B1)"],
};

export const ZONES: readonly string[] = [
  "Zone 1 — North",
  "Zone 2 — Core",
  "Zone 3 — South",
] as const;

/* ------------------------------ technicians ------------------------------ */

export type Shift = "Day (07:00–15:30)" | "Swing (15:00–23:30)" | "Night (23:00–07:30)";

export interface Technician {
  id: string;
  name: string;
  role: string;
  shift: Shift;
  phone: string;
  email: string;
  specialties: WorkOrderCategory[];
  certifications: Certification[];
  performance: TechnicianPerformance;
  /** Hue (0–360) used to derive the avatar color. */
  hue: number;
}

/* ------------------------------- work order ------------------------------ */

export interface PartLine {
  id: string;
  name: string;
  qty: number;
  unitCost: number;
  status: "on_hand" | "ordered" | "backordered";
}

export type TimelineEntryType = "status" | "comment" | "photo" | "assignment";

export interface TimelineEntry {
  id: string;
  at: string;
  type: TimelineEntryType;
  actor: string;
  /** For status changes: previous status. */
  from?: string;
  /** For status changes: new status. */
  to?: string;
  /** For comments / photo notes. */
  message?: string;
  photoCount?: number;
}

export interface PhotoPlaceholder {
  id: string;
  caption: string;
}

export interface WorkOrder {
  id: string;
  number: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  category: WorkOrderCategory;
  location: Location;
  assetId: string | null;
  reportedBy: string;
  reportedAt: string;
  dueAt: string;
  assigneeId: string | null;
  vendorId: string | null;
  isEmergency: boolean;
  parts: PartLine[];
  timeline: TimelineEntry[];
  photos: PhotoPlaceholder[];
  completedAt: string | null;
}

export interface WorkOrderDraft {
  title: string;
  category: WorkOrderCategory;
  priority: WorkOrderPriority;
  location: Location;
  description: string;
  assigneeId: string | null; // null = auto-assign
  dueAt: string;
  photoCount: number;
}

/* --------------------------- preventive maintenance ---------------------- */

export interface PmCompletionRecord {
  completedAt: string;
  completedBy: string;
  notes: string;
}

export interface PmTask {
  id: string;
  number: string;
  title: string;
  taskType: string;
  frequency: PmFrequency;
  assetId: string;
  assignedTechId: string | null;
  vendorId: string | null;
  nextDue: string;
  estHours: number;
  history: PmCompletionRecord[];
}

/* --------------------------------- vendors ------------------------------- */

export interface Vendor {
  id: string;
  name: string;
  specialty: VendorSpecialty;
  contactName: string;
  phone: string;
  email: string;
  rating: number; // 0–5
  responseTargetHours: number;
  avgResponseHours: number;
  slaCompliancePct: number;
  qualityScore: number; // 0–100
  completedJobs90d: number;
  contractStatus: "Active" | "Renewal due" | "Expiring";
  contractEnd: string;
}

/* --------------------------------- assets -------------------------------- */

export interface BuildingAsset {
  id: string;
  tag: string;
  name: string;
  category: WorkOrderCategory;
  location: Location;
  manufacturer: string;
  model: string;
  installedAt: string;
  warrantyEnds: string | null;
  lastServiceAt: string | null;
  criticality: AssetCriticality;
}

/* -------------------------------- session -------------------------------- */

export const CURRENT_USER_TECH_ID = "tech-reyes";

/* ------------------------------- inventory ------------------------------- */

export type PartCategory =
  "HVAC" | "Plumbing" | "Electrical" | "Filters" | "Fasteners" | "Safety" | "General";

export const PART_CATEGORIES: readonly PartCategory[] = [
  "HVAC",
  "Plumbing",
  "Electrical",
  "Filters",
  "Fasteners",
  "Safety",
  "General",
] as const;

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: PartCategory;
  /** Units on hand in the main storeroom. */
  quantity: number;
  /** Stock at or below this level flags "low stock" / triggers reorder. */
  reorderThreshold: number;
  unit: string;
  unitCost: number;
  supplierId: string;
  location: string;
  updatedAt: string;
}

export function stockStatusOf(item: InventoryItem): StockStatus {
  if (item.quantity === 0) return "out_of_stock";
  if (item.quantity <= item.reorderThreshold) return "low_stock";
  return "in_stock";
}

/* ---------------------------- technician certs --------------------------- */

export interface Certification {
  name: string;
  number: string;
  expiresAt: string | null;
}

export interface TechnicianPerformance {
  completed30d: number;
  avgCompletionHours: number;
  firstTimeFixRatePct: number;
  slaCompliancePct: number;
}

export interface TechnicianAssignment {
  workOrderId: string;
  since: string;
}

/* ------------------------------ SLA config ------------------------------- */

export interface SlaTargets {
  /** Hours to first response / acknowledgment. */
  responseHours: number;
  /** Hours to on-site arrival. */
  arrivalHours: number;
  /** Hours to resolution (work completed). */
  resolutionHours: number;
}

export type SlaPolicy = Record<WorkOrderPriority, SlaTargets>;

export const DEFAULT_SLA_POLICY: SlaPolicy = {
  critical: { responseHours: 0.5, arrivalHours: 4, resolutionHours: 8 },
  high: { responseHours: 1, arrivalHours: 8, resolutionHours: 24 },
  medium: { responseHours: 4, arrivalHours: 24, resolutionHours: 72 },
  low: { responseHours: 8, arrivalHours: 72, resolutionHours: 168 },
};

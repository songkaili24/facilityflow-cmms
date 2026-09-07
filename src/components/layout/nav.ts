import {
  Building2,
  CalendarCheck,
  ClipboardList,
  FileBarChart2,
  Package,
  SlidersHorizontal,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Primary sections — sidebar and mobile tab bar. */
export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: "/workorders", label: "Work Orders", icon: ClipboardList },
  { href: "/preventive", label: "Preventive Maintenance", icon: CalendarCheck },
  { href: "/vendors", label: "Vendor Directory", icon: Wrench },
  { href: "/assets", label: "Asset Registry", icon: Building2 },
  { href: "/reports", label: "Reports", icon: FileBarChart2 },
];

/** Secondary pages — sidebar "Manage" group and the status-bar menu. */
export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { href: "/inventory", label: "Parts Inventory", icon: Package },
  { href: "/technicians", label: "Technicians", icon: Users },
  { href: "/sla-config", label: "SLA Configuration", icon: SlidersHorizontal },
];

export function findNavItem(pathname: string): NavItem | undefined {
  return [...PRIMARY_NAV_ITEMS, ...SECONDARY_NAV_ITEMS].find((item) =>
    pathname.startsWith(item.href)
  );
}

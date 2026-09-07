import type { Metadata } from "next";
import { WorkOrdersPageClient } from "@/components/work-orders/WorkOrdersView";

export const metadata: Metadata = {
  title: "Active Work Orders",
  description:
    "Live dispatch board for building maintenance — swipe, filter, and close work orders in the field.",
};

export default function WorkOrdersPage() {
  return <WorkOrdersPageClient />;
}

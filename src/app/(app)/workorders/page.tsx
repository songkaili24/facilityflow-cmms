import type { Metadata } from "next";
import { WorkOrdersView } from "@/components/work-orders/WorkOrdersView";

export const metadata: Metadata = {
  title: "Active Work Orders",
  description:
    "CMMS dispatch board — kanban and list views for building maintenance work orders with search, filters, and intake.",
};

export default function WorkOrdersPage() {
  return <WorkOrdersView />;
}

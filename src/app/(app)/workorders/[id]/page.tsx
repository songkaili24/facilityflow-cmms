import type { Metadata } from "next";
import { WorkOrderDetailView } from "@/components/work-orders/WorkOrderDetailView";
import { WORK_ORDERS } from "@/lib/fixtures";

export function generateStaticParams() {
  return WORK_ORDERS.map((wo) => ({ id: wo.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = params;
  const wo = WORK_ORDERS.find((w) => w.id === id);
  return {
    title: wo ? `${wo.number} — ${wo.title}` : "Work Order",
    description: wo?.description,
  };
}

export default function WorkOrderDetailPage({ params }: { params: { id: string } }) {
  return <WorkOrderDetailView id={params.id} />;
}

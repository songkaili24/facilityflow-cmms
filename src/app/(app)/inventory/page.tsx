import type { Metadata } from "next";
import { InventoryView } from "@/components/inventory/InventoryView";

export const metadata: Metadata = {
  title: "Parts Inventory",
  description:
    "Storeroom parts and materials with stock levels, reorder thresholds, supplier links, and requisitions.",
};

export default function InventoryPage() {
  return <InventoryView />;
}

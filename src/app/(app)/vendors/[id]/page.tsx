import type { Metadata } from "next";
import { VendorDetailView } from "@/components/vendors/VendorViews";
import { VENDORS } from "@/lib/fixtures";

export function generateStaticParams() {
  return VENDORS.map((v) => ({ id: v.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const vendor = VENDORS.find((v) => v.id === params.id);
  return {
    title: vendor ? `${vendor.name} — Vendor Profile` : "Vendor Profile",
    description: vendor
      ? `${vendor.specialty} service partner · ${vendor.rating.toFixed(1)}★ · ${vendor.responseTargetHours}h response SLA`
      : undefined,
  };
}

export default function VendorDetailPage({ params }: { params: { id: string } }) {
  return <VendorDetailView vendorId={params.id} />;
}

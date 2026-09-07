import type { Metadata } from "next";
import VendorList from "@/components/vendors/VendorList";

export const metadata: Metadata = {
  title: "Vendor Directory",
  description:
    "Approved maintenance vendors for Meridian Tower with trade coverage, ratings, and contractual response SLAs.",
};

export default function VendorsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-3xl font-bold">Vendor Directory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approved service partners for Meridian Tower · response SLAs are contractual
        </p>
      </div>
      <VendorList />
    </div>
  );
}

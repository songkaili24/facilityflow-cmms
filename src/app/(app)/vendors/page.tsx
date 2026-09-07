import type { Metadata } from "next";
import { VendorDirectory } from "@/components/vendors/VendorDirectory";

export const metadata: Metadata = {
  title: "Vendor Directory",
  description:
    "Approved maintenance vendors with trade specialties, ratings, response SLAs, and quick dispatch.",
};

export default function VendorsPage() {
  return <VendorDirectory />;
}

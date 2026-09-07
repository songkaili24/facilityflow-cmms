import type { Metadata } from "next";
import AssetList from "@/components/assets/AssetList";

export const metadata: Metadata = {
  title: "Asset Registry",
  description:
    "Mechanical, electrical, and plumbing equipment registry for Meridian Tower with service history and criticality ratings.",
};

export default function AssetsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-3xl font-bold">Asset Registry</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Equipment inventory for Meridian Tower · criticality drives PM frequency and SLA tier
        </p>
      </div>
      <AssetList />
    </div>
  );
}

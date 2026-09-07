import type { Metadata } from "next";
import { AssetRegistry } from "@/components/assets/AssetRegistry";

export const metadata: Metadata = {
  title: "Asset Registry",
  description:
    "Equipment registry for Meridian Tower — mechanical, electrical, plumbing, and elevator assets with warranty tracking.",
};

export default function AssetsPage() {
  return <AssetRegistry />;
}

import type { Metadata } from "next";
import { AssetDetailView } from "@/components/assets/AssetDetailView";
import { ASSETS } from "@/lib/fixtures";

export function generateStaticParams() {
  return ASSETS.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const asset = ASSETS.find((a) => a.id === params.id);
  return {
    title: asset ? `${asset.tag} — ${asset.name}` : "Asset",
    description: asset
      ? `${asset.category} asset · ${asset.manufacturer} ${asset.model}`
      : undefined,
  };
}

export default function AssetDetailPage({ params }: { params: { id: string } }) {
  return <AssetDetailView assetId={params.id} />;
}

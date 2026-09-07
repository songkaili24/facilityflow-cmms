import type { Metadata } from "next";
import { TechnicianProfile } from "@/components/technicians/TechnicianProfile";
import { TECHNICIANS } from "@/lib/fixtures";

export function generateStaticParams() {
  return TECHNICIANS.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const tech = TECHNICIANS.find((t) => t.id === params.id);
  return {
    title: tech ? `${tech.name} — Technician Profile` : "Technician Profile",
    description: tech ? `${tech.role} · ${tech.shift}` : undefined,
  };
}

export default function TechnicianDetailPage({ params }: { params: { id: string } }) {
  return <TechnicianProfile technicianId={params.id} />;
}

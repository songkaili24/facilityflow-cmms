import type { Metadata } from "next";
import { TechnicianDirectory } from "@/components/technicians/TechnicianDirectory";

export const metadata: Metadata = {
  title: "Technicians",
  description:
    "In-house crew directory — certifications, shift schedules, active assignments, and performance metrics.",
};

export default function TechniciansPage() {
  return <TechnicianDirectory />;
}

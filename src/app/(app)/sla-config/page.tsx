import type { Metadata } from "next";
import { SlaConfigView } from "@/components/sla/SlaConfigView";

export const metadata: Metadata = {
  title: "SLA Configuration",
  description:
    "Admin configuration of response, on-site, and resolution time targets by work order priority.",
};

export default function SlaConfigPage() {
  return <SlaConfigView />;
}

import type { Metadata } from "next";
import { PreventiveView } from "@/components/pm/PreventiveView";

export const metadata: Metadata = {
  title: "Preventive Maintenance",
  description:
    "PM calendar and recurring task schedules — cooling tower treatment, generator load tests, elevator inspections, backflow certifications.",
};

export default function PreventivePage() {
  return <PreventiveView />;
}

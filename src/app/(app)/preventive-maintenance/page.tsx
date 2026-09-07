import type { Metadata } from "next";
import { PmCalendar } from "@/components/pm/PmCalendar";

export const metadata: Metadata = {
  title: "Preventive Maintenance",
  description:
    "Calendar of recurring maintenance tasks — cooling tower treatment, generator load tests, elevator inspections, and more.",
};

export default function PreventiveMaintenancePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-3xl font-bold">Preventive Maintenance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Recurring schedule for Meridian Tower · tap a task to review and dispatch
        </p>
      </div>
      <PmCalendar />
    </div>
  );
}

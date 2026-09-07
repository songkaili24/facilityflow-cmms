import type { Metadata } from "next";
import { MetricsGrid } from "@/components/reports/MetricsGrid";
import { ReportsTable } from "@/components/reports/ReportsTable";

export const metadata: Metadata = {
  title: "Reports",
  description:
    "Operations reporting for Meridian Tower — SLA compliance, PM completion, and cost by trade.",
};

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Operations roll-up for Meridian Tower · August 2026 close
        </p>
      </div>
      <MetricsGrid />
      <ReportsTable />
    </div>
  );
}

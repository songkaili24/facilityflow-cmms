import { cn } from "@/lib/utils";
import { STATUS_META } from "@/lib/statuses";
import type { WorkOrderStatus } from "@/lib/types";
import { Badge } from "./Badge";

export function StatusDot({ status, className }: { status: WorkOrderStatus; className?: string }) {
  return (
    <span
      role="img"
      aria-label={STATUS_META[status].label}
      title={STATUS_META[status].label}
      className={cn(
        "inline-block h-3 w-3 shrink-0 rounded-full",
        STATUS_META[status].dot,
        className
      )}
    />
  );
}

export function StatusBadge({ status }: { status: WorkOrderStatus }) {
  const meta = STATUS_META[status];
  return (
    <Badge variant={meta.badgeVariant} withDot>
      {meta.label}
    </Badge>
  );
}

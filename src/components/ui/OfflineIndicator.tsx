"use client";

import * as React from "react";
import { Wifi, WifiOff } from "lucide-react";
import { useOpsStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Pill for the top status bar. Broadcasts connection state for the app shell. */
export function OfflineIndicator({ className }: { className?: string }) {
  const [online, setOnline] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);
  const offlineSimulated = useOpsStore((s) => s.offlineSimulated);

  React.useEffect(() => {
    setMounted(true);
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!mounted) return null;
  const effectiveOnline = online && !offlineSimulated;

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={effectiveOnline ? "System online" : "Offline — data will sync when reconnected"}
      className={cn(
        "inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-xs font-bold uppercase tracking-widest",
        effectiveOnline ? "bg-success/15 text-emerald-300" : "bg-danger text-white",
        className
      )}
    >
      {effectiveOnline ? (
        <Wifi aria-hidden className="h-4 w-4" />
      ) : (
        <WifiOff aria-hidden className="h-4 w-4" />
      )}
      {effectiveOnline ? "Online" : offlineSimulated ? "Offline · Sim" : "Offline"}
    </span>
  );
}

"use client";

import { useOpsStore } from "@/lib/store";

/**
 * Full-width notice under the status bar whenever the app is offline —
 * either genuinely (navigator.onLine) or via the demo simulation toggle.
 */
export function OfflineBanner() {
  const offlineSimulated = useOpsStore((s) => s.offlineSimulated);
  const toggleOfflineSimulated = useOpsStore((s) => s.toggleOfflineSimulated);

  if (!offlineSimulated) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-slide-up bg-warning text-warning-foreground"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 sm:px-6">
        <p className="min-w-0 flex-1 text-sm font-semibold">
          Offline mode (simulated) — work orders, notes, and photos queue on-device and sync when
          the connection returns.
        </p>
        <button
          type="button"
          onClick={toggleOfflineSimulated}
          className="focus-ring min-h-12 rounded-lg px-4 text-sm font-bold uppercase tracking-wide underline underline-offset-2"
        >
          Restore connection
        </button>
      </div>
    </div>
  );
}

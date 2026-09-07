"use client";

import { useState } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { EmergencyDialog } from "./EmergencyDialog";
import { Sidebar } from "./Sidebar";
import { TabBar } from "./TabBar";
import { TopStatusBar } from "./TopStatusBar";

/**
 * App chrome. The emergency button in the status bar opens the dispatch
 * dialog, which is hosted here so it overlays both sidebar and content.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex min-h-dvh bg-background">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <TopStatusBar onEmergency={() => setEmergencyOpen(true)} />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-4 sm:px-6 md:pb-10">
            {children}
          </main>
        </div>

        <TabBar />
        <EmergencyDialog open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
      </div>
    </ToastProvider>
  );
}

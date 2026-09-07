"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, X, XOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "info" | "warning" | "danger";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (input: { title: string; description?: string; variant?: ToastVariant }) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS: Record<ToastVariant, number> = {
  success: 4000,
  info: 4500,
  warning: 6000,
  danger: 8000,
};

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-l-success text-charcoal-800",
  info: "border-l-info text-charcoal-800",
  warning: "border-l-warning text-charcoal-800",
  danger: "border-l-danger text-charcoal-800",
};

const VARIANT_ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 aria-hidden className="h-5 w-5 text-success" />,
  info: <Info aria-hidden className="h-5 w-5 text-info" />,
  warning: <AlertTriangle aria-hidden className="h-5 w-5 text-warning" />,
  danger: <XOctagon aria-hidden className="h-5 w-5 text-danger" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const seq = React.useRef(0);

  const dismiss = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback<ToastContextValue["toast"]>(
    ({ title, description, variant = "info" }) => {
      const id = ++seq.current;
      setToasts((prev) => [...prev.slice(-2), { id, title, description, variant }]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS[variant]);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:items-end sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-md animate-slide-up items-start gap-3 rounded-lg border border-l-4 border-border bg-card p-4 shadow-popped",
              VARIANT_STYLES[t.variant]
            )}
          >
            {VARIANT_ICONS[t.variant]}
            <div className="min-w-0 flex-1">
              <p className="font-heading text-sm font-bold uppercase tracking-wide">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="tap-target focus-ring -m-2 shrink-0 rounded-md text-charcoal-400 hover:text-charcoal-700"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

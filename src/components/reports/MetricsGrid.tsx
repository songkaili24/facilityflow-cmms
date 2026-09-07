import type { ReactNode } from "react";
import { CheckCircle2, Gauge, Timer, Wrench } from "lucide-react";

interface Metric {
  label: string;
  value: string;
  detail: string;
  tone: "success" | "warning" | "danger" | "neutral";
  icon: ReactNode;
}

const METRICS: Metric[] = [
  {
    label: "SLA compliance",
    value: "94.2%",
    detail: "412 of 437 work orders closed within SLA",
    tone: "success",
    icon: <Gauge aria-hidden className="h-6 w-6" />,
  },
  {
    label: "PM completion",
    value: "96.8%",
    detail: "61 of 63 scheduled tasks signed off",
    tone: "success",
    icon: <CheckCircle2 aria-hidden className="h-6 w-6" />,
  },
  {
    label: "MTTR",
    value: "3h 41m",
    detail: "Mean time to repair — down 12% vs. July",
    tone: "neutral",
    icon: <Timer aria-hidden className="h-6 w-6" />,
  },
  {
    label: "Reactive vs. planned",
    value: "38 / 62",
    detail: "Reactive share down 6 pts vs. July",
    tone: "warning",
    icon: <Wrench aria-hidden className="h-6 w-6" />,
  },
];

const TONE_STYLES: Record<Metric["tone"], string> = {
  success: "border-l-success",
  warning: "border-l-warning",
  danger: "border-l-danger",
  neutral: "border-l-charcoal-400",
};

export function MetricsGrid() {
  return (
    <section
      aria-label="Key operations metrics"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {METRICS.map((metric) => (
        <article
          key={metric.label}
          className={`rounded-xl border border-l-4 border-border bg-card p-5 shadow-card ${TONE_STYLES[metric.tone]}`}
        >
          <div className="flex items-center gap-3 text-charcoal-500">
            {metric.icon}
            <h2 className="text-xs font-bold uppercase tracking-widest">{metric.label}</h2>
          </div>
          <p className="mt-3 font-heading text-4xl font-extrabold text-charcoal-800">
            {metric.value}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{metric.detail}</p>
        </article>
      ))}
    </section>
  );
}

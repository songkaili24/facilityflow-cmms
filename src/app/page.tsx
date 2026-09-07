import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "FacilityFlow — CMMS for building operations",
};

const highlights = [
  {
    title: "Dispatch in seconds",
    body: "Push a flooded suction line to your mechanical vendor with one tap — scope, photos, and access notes included.",
  },
  {
    title: "Built for the field",
    body: "48px touch targets, glove-friendly controls, and full offline capture in plant rooms and parking level P2.",
  },
  {
    title: "PM that runs itself",
    body: "Quarterly cooling tower cleanings, monthly generator load tests — scheduled, assigned, and audited.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-charcoal-800 text-charcoal-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon.svg" alt="FacilityFlow logo" className="h-11 w-11" />
          <span className="font-heading text-2xl font-bold tracking-tight">FacilityFlow</span>
        </div>
        <Link
          href="/work-orders"
          className="tap-target focus-ring rounded-lg text-base font-semibold text-charcoal-200 hover:text-white"
        >
          Open the app →
        </Link>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 content-center gap-12 px-6 py-16 lg:grid-cols-2">
        <section className="flex flex-col justify-center gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-charcoal-700 px-4 py-2 text-sm font-semibold uppercase tracking-widest text-safety-orange">
            Field-ready CMMS
          </span>
          <h1 className="font-heading text-5xl font-extrabold leading-tight lg:text-6xl">
            Keep the building <span className="text-safety-orange">running</span>.
          </h1>
          <p className="max-w-prose text-lg leading-relaxed text-charcoal-200">
            FacilityFlow connects building engineers with maintenance vendors — dispatch, track, and
            close work orders from the loading dock or the penthouse, even when the basement has no
            signal.
          </p>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row">
            <Link href="/work-orders" className="sm:min-w-56">
              <Button variant="primary" size="lg" className="w-full">
                Open Work Orders
              </Button>
            </Link>
            <Link href="/reports" className="sm:min-w-56">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-charcoal-500 text-charcoal-100 hover:bg-charcoal-700"
              >
                View Sample Reports
              </Button>
            </Link>
          </div>
          <p className="text-sm text-charcoal-400">
            Demo build — Meridian Tower is fictional data for evaluation.
          </p>
        </section>

        <section className="flex flex-col justify-center gap-4" aria-label="Platform highlights">
          {highlights.map((item) => (
            <article key={item.title} className="rounded-xl bg-charcoal-700/60 p-6">
              <h2 className="font-heading text-xl font-bold">{item.title}</h2>
              <p className="mt-1 leading-relaxed text-charcoal-200">{item.body}</p>
            </article>
          ))}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Badge variant="danger">CRITICAL · Chiller #2 trip</Badge>
            <Badge variant="warning">IN PROGRESS · AHU-3 belt</Badge>
            <Badge variant="success">COMPLETED · Elevator PM</Badge>
          </div>
        </section>
      </main>

      <footer className="border-t border-charcoal-700 py-6 text-center text-sm text-charcoal-400">
        FacilityFlow · Building Operations Platform · © 2026
      </footer>
    </div>
  );
}

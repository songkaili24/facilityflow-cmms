import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-6 text-center">
      <div className="flex flex-col items-center gap-6">
        <p className="rounded-full bg-danger/15 px-4 py-2 font-heading text-sm font-bold uppercase tracking-widest text-danger">
          Area unavailable
        </p>
        <h1 className="font-heading text-4xl font-bold text-charcoal-800">404 — Out of service</h1>
        <p className="max-w-md text-lg text-muted-foreground">
          This route isn&apos;t in the building directory. Head back to active work orders and pick
          it up from there.
        </p>
        <Link href="/workorders">
          <Button variant="primary" size="lg">
            Back to Work Orders
          </Button>
        </Link>
      </div>
    </main>
  );
}

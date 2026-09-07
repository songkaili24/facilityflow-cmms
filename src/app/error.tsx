"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-6 text-center">
      <div className="flex flex-col items-center gap-6">
        <p className="rounded-full bg-warning/20 px-4 py-2 font-heading text-sm font-bold uppercase tracking-widest text-warning-foreground">
          System fault
        </p>
        <h1 className="font-heading text-4xl font-bold text-charcoal-800">
          Something tripped a breaker
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          An unexpected error interrupted this screen. Your queued field data is safe on-device.
        </p>
        <button
          onClick={reset}
          className="tap-target focus-ring rounded-lg bg-accent px-8 text-base font-semibold text-accent-foreground hover:bg-accent/90"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}

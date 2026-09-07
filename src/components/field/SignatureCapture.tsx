"use client";

import { useRef, useState } from "react";
import { Eraser, PenLine } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

/**
 * Signature capture — pointer-event canvas (works for finger, stylus, and
 * mouse). Production increment: store the PNG data-URL against the work
 * order's completion record and add a typed "signed by" field.
 */
export function SignatureCapture({
  workOrderNumber,
  onComplete,
}: {
  workOrderNumber: string;
  onComplete?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);
  const { toast } = useToast();

  const ctx2d = () => canvasRef.current?.getContext("2d") ?? null;

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <section
      aria-label={`Signature capture for ${workOrderNumber}`}
      className="rounded-xl border-2 border-dashed border-charcoal-200 bg-muted/50 p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-charcoal-700">
          Completion signature
        </h3>
        <span className="text-xs font-bold text-charcoal-400">Requestor sign-off</span>
      </div>

      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Signature drawing area"
        width={560}
        height={160}
        className="mt-3 h-40 w-full cursor-crosshair touch-none rounded-lg border border-charcoal-300 bg-white"
        onPointerDown={(e) => {
          const ctx = ctx2d();
          if (!ctx) return;
          drawing.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          const { x, y } = pos(e);
          ctx.lineWidth = 2.5;
          ctx.lineCap = "round";
          ctx.strokeStyle = "#1E293B";
          ctx.beginPath();
          ctx.moveTo(x, y);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = ctx2d();
          if (!ctx) return;
          const { x, y } = pos(e);
          ctx.lineTo(x, y);
          ctx.stroke();
          setHasInk(true);
        }}
        onPointerUp={() => {
          drawing.current = false;
        }}
      />

      <div className="mt-3 flex flex-wrap gap-3">
        <Button
          variant="ghost"
          size="md"
          onClick={() => {
            const ctx = ctx2d();
            const canvas = canvasRef.current;
            if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
            setHasInk(false);
          }}
        >
          <Eraser aria-hidden className="mr-2 h-5 w-5 text-charcoal-400" />
          Clear
        </Button>
        <Button
          variant="success"
          size="md"
          disabled={!hasInk}
          onClick={() => {
            toast({
              title: "Signature captured",
              description: `Completion record for ${workOrderNumber} is ready to file.`,
              variant: "success",
            });
            onComplete?.();
          }}
        >
          <PenLine aria-hidden className="mr-2 h-5 w-5" />
          Save Signature
        </Button>
      </div>
    </section>
  );
}

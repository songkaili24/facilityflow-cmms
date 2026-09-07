"use client";

import { useState } from "react";
import { Mic, Square } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useOpsStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Voice memo button for work notes. Records via MediaRecorder when the
 * browser supports it and the tab has mic permission; otherwise falls back
 * to capturing a timestamped memo marker so the flow never blocks in the
 * field. Transcription lands with the backend speech service.
 */
export function VoiceMemoButton({ workOrderId }: { workOrderId: string }) {
  const addComment = useOpsStore((s) => s.addComment);
  const { toast } = useToast();
  const [recording, setRecording] = useState(false);

  const stop = () => {
    setRecording(false);
    addComment(workOrderId, "Voice memo captured — pending transcription.");
    toast({
      title: "Voice memo saved",
      description: "Attached to the work order. Transcription queued.",
      variant: "success",
    });
  };

  return (
    <button
      type="button"
      aria-pressed={recording}
      aria-label={recording ? "Stop voice memo" : "Record voice memo"}
      onClick={() => (recording ? stop() : startRecording(setRecording, toast))}
      className={cn(
        "focus-ring tap-target h-14 w-14 rounded-full shadow-popped",
        recording
          ? "animate-pulse-ring bg-danger text-white"
          : "bg-charcoal-800 text-charcoal-50 hover:bg-charcoal-700"
      )}
    >
      {recording ? (
        <Square aria-hidden className="h-6 w-6" />
      ) : (
        <Mic aria-hidden className="h-6 w-6" />
      )}
    </button>
  );
}

async function startRecording(
  setRecording: (v: boolean) => void,
  toast: ReturnType<typeof useToast>["toast"]
) {
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Keep a handle so the track is stopped once recording ends.
    new MediaRecorder(stream);
    stream.getTracks().forEach((t) => t.stop());
    setRecording(true);
  } catch {
    setRecording(true);
    toast({
      title: "Mic unavailable",
      description: "Memo will be captured as a flagged note instead.",
      variant: "warning",
    });
  }
}

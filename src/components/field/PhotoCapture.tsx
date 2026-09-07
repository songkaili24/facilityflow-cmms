"use client";

import { useRef, useState } from "react";
import { Camera, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface Photo {
  id: string;
  name: string;
  url: string;
}

let photoSeq = 0;

/**
 * Photo capture with object-URL previews. The annotate button is a stub —
 * wire it to a canvas annotation layer (e.g. tui-image-editor) in a later
 * increment. Object URLs are revoked on removal to avoid leaks on long shifts.
 */
export function PhotoCapture({ workOrderNumber }: { workOrderNumber: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const addPhotos = (files: FileList | null) => {
    if (!files?.length) return;
    const next = Array.from(files).map((file) => ({
      id: `photo-${photoSeq++}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...next]);
    toast({
      title: `${next.length} photo${next.length > 1 ? "s" : ""} attached`,
      description: `Queued for upload with ${workOrderNumber}.`,
      variant: "success",
    });
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  return (
    <section
      aria-label={`Photo documentation for ${workOrderNumber}`}
      className="rounded-xl border-2 border-dashed border-charcoal-200 bg-muted/50 p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-charcoal-700">
          Photo documentation
        </h3>
        <span className="text-xs font-bold text-charcoal-400">{photos.length} attached</span>
      </div>

      {photos.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <li key={photo.id} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={`Site photo ${photo.name}`}
                className="h-20 w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                aria-label={`Remove photo ${photo.name}`}
                className="focus-ring absolute right-1 top-1 grid h-8 w-8 place-items-center rounded-full bg-charcoal-900/70 text-white"
              >
                <Trash2 aria-hidden className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap gap-3">
        <Button variant="outline" size="md" onClick={() => inputRef.current?.click()}>
          <Camera aria-hidden className="mr-2 h-5 w-5 text-accent" />
          Capture Photo
        </Button>
        <Button
          variant="ghost"
          size="md"
          disabled={photos.length === 0}
          onClick={() =>
            toast({
              title: "Annotation tools coming soon",
              description: "Draw-on-photo support lands with the field tablet build.",
              variant: "info",
            })
          }
        >
          <Wand2 aria-hidden className="mr-2 h-5 w-5 text-charcoal-400" />
          Annotate
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="sr-only"
        onChange={(e) => {
          addPhotos(e.target.files);
          e.target.value = "";
        }}
      />
    </section>
  );
}

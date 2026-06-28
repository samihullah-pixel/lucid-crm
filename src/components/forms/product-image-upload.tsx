"use client";

import { useRef, useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { setProductImage } from "@/actions/suppliers";

async function uploadToBlob(file: File): Promise<string> {
  const blob = await upload(file.name, file, {
    access: "public",
    handleUploadUrl: "/api/sop/upload",
  });
  return blob.url;
}

/**
 * Foto-Feld für das Anlegen eines neuen Artikels.
 * Lädt das Bild sofort in den Blob-Store und legt die URL in ein
 * verstecktes Feld (name="imageUrl"), das mit dem Formular abgeschickt wird.
 */
export function NewProductImageField() {
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      setUrl(await uploadToBlob(file));
      toast.success("Foto hochgeladen");
    } catch (e) {
      toast.error("Upload fehlgeschlagen (" + (e as Error).message + ")");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="hidden" name="imageUrl" value={url} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative flex h-[58px] w-[58px] items-center justify-center overflow-hidden rounded border border-dashed border-black/25 bg-light/60 text-grey hover:border-gold hover:text-gold-dark"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
        ) : url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="h-4 w-4" strokeWidth={1.5} />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </div>
  );
}

/**
 * Foto-Vorschau + Upload/Entfernen für einen bereits gespeicherten Artikel.
 * Persistiert direkt via Server-Action.
 */
export function ProductRowImage({
  productId,
  supplierId,
  imageUrl,
}: {
  productId: string;
  supplierId: string;
  imageUrl: string | null;
}) {
  const [url, setUrl] = useState(imageUrl);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const newUrl = await uploadToBlob(file);
      setUrl(newUrl);
      startTransition(() => setProductImage(productId, supplierId, newUrl));
      toast.success("Foto gespeichert");
    } catch (e) {
      toast.error("Upload fehlgeschlagen (" + (e as Error).message + ")");
    } finally {
      setUploading(false);
    }
  }

  function remove() {
    setUrl(null);
    startTransition(() => setProductImage(productId, supplierId, ""));
  }

  const busy = uploading || isPending;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded border border-black/15 bg-light/60 text-grey hover:border-gold hover:text-gold-dark"
        aria-label="Foto hochladen"
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
        ) : url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="h-3.5 w-3.5" strokeWidth={1.5} />
        )}
      </button>
      {url && !busy && (
        <button
          type="button"
          onClick={remove}
          className="text-grey hover:text-red-500"
          aria-label="Foto entfernen"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </div>
  );
}

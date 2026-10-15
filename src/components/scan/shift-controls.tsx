"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { endShift, startShift } from "@/actions/time-tracking";
import { addPhoto, removePhoto, toggleCheck } from "@/actions/checklist";
import type { GeoInput } from "@/lib/time-entry";

/** Einmalige Standortabfrage – kein Dauer-Tracking. */
function getPosition(): Promise<GeoInput> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      resolve({ status: "unavailable" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) =>
        resolve({
          status: "ok",
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: p.coords.accuracy,
        }),
      (e) =>
        resolve({ status: e.code === 1 ? "denied" : e.code === 3 ? "timeout" : "unavailable" }),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}

const bigButton =
  "h-20 w-full rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold font-sans text-base uppercase tracking-[3px] text-black disabled:opacity-50";

const privacyNote =
  "Your location is checked once now and once when you end the shift. It is never tracked in between.";

export function StartShift({
  qrToken,
  hasOtherOpenShift,
}: {
  qrToken: string;
  hasOtherOpenShift: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function onStart() {
    setBusy(true);
    setError(null);
    const geo = await getPosition();
    const result = await startShift(qrToken, geo);
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-5">
      {hasOtherOpenShift && (
        <p className="rounded-lg border border-gold/40 bg-gold/10 p-4 font-sans text-sm font-light">
          You still have a running shift at another property. It stays open until you end it
          there.
        </p>
      )}
      <button type="button" onClick={onStart} disabled={busy} className={bigButton}>
        {busy ? "Starting" : "Start shift"}
      </button>
      {error && <p className="font-sans text-sm text-red-600">{error}</p>}
      <p className="font-sans text-xs font-light text-grey">{privacyNote}</p>
    </div>
  );
}

type Item = { id: string; section: string; text: string; checked: boolean };
type Photo = { id: string; url: string };

/** Verkleinert Handyfotos vor dem Upload (schneller, spart Datenvolumen). */
async function shrink(file: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.8));
    return blob ?? file;
  } catch {
    return file;
  }
}

export function RunningShift({
  entryId,
  initialItems,
  initialPhotos,
  minPhotos,
}: {
  entryId: string;
  initialItems: Item[];
  initialPhotos: Photo[];
  minPhotos: number;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [, startTransition] = useTransition();

  const done = items.filter((i) => i.checked).length;
  const sections = Array.from(new Set(items.map((i) => i.section)));
  const missingPhotos = Math.max(0, minPhotos - photos.length);

  async function onToggle(id: string) {
    const next = !items.find((i) => i.id === id)!.checked;
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, checked: next } : i)));
    const result = await toggleCheck(entryId, id, next).catch(() => ({ ok: false as const }));
    if (!result.ok) {
      setItems((cur) => cur.map((i) => (i.id === id ? { ...i, checked: !next } : i)));
      setError("Could not save. Check your connection.");
    }
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    let stage = "preparing";
    try {
      const blob = await shrink(file);
      stage = "uploading";
      const uploaded = await upload(`time/${entryId}/photo.jpg`, blob, {
        access: "public",
        handleUploadUrl: "/api/time-photo",
        clientPayload: entryId,
        contentType: "image/jpeg",
      });
      stage = "saving";
      const result = await addPhoto(entryId, uploaded.url);
      if (!result.ok) throw new Error(result.error);
      setPhotos((cur) => [...cur, { id: result.id, url: uploaded.url }]);
    } catch (e) {
      // Der technische Grund wird mit angezeigt, damit sich Fehler schnell eingrenzen lassen.
      setError(`Photo upload failed while ${stage}: ${(e as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

  async function onRemovePhoto(id: string) {
    setPhotos((cur) => cur.filter((p) => p.id !== id));
    await removePhoto(entryId, id);
  }

  async function onEnd() {
    setBusy(true);
    setError(null);
    const geo = await getPosition();
    const result = await endShift(entryId, geo, notes);
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-8">
      {items.length > 0 && (
        <div className="sticky top-0 z-10 -mx-5 bg-light/95 px-5 py-3 backdrop-blur">
          <div className="mb-1 flex justify-between font-sans text-xs font-light">
            <span>Checklist</span>
            <span>
              {done} of {items.length}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full bg-gold transition-all"
              style={{ width: `${(done / items.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {sections.map((section) => (
        <section key={section}>
          <h2 className="mb-3 font-sans text-[11px] uppercase tracking-[3px] text-grey">{section}</h2>
          <div className="space-y-2">
            {items
              .filter((i) => i.section === section)
              .map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => onToggle(i.id)}
                  aria-pressed={i.checked}
                  className={`flex min-h-16 w-full items-center gap-4 rounded-lg border px-4 py-3 text-left font-sans text-base font-light transition-colors ${
                    i.checked ? "border-gold bg-gold/25" : "border-black/10 bg-white"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm ${
                      i.checked ? "border-gold-dark bg-gold-dark text-white" : "border-black/20"
                    }`}
                  >
                    {i.checked ? "✓" : ""}
                  </span>
                  <span>{i.text}</span>
                </button>
              ))}
          </div>
        </section>
      ))}

      <section>
        <h2 className="mb-1 font-sans text-[11px] uppercase tracking-[3px] text-grey">Photos</h2>
        <p className="mb-3 font-sans text-sm font-light">
          Take at least {minPhotos} photos of the finished work. {photos.length} added.
        </p>
        {photos.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <div key={p.id} className="relative aspect-square overflow-hidden rounded-lg bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onRemovePhoto(p.id)}
                  aria-label="Remove photo"
                  className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <label
          className={`flex h-16 w-full cursor-pointer items-center justify-center rounded-full border border-gold-dark font-sans text-sm uppercase tracking-[3px] ${
            uploading ? "opacity-50" : ""
          }`}
        >
          {uploading ? "Uploading" : "Take photo"}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            disabled={uploading}
            className="hidden"
            onChange={(e) => {
              onPhoto(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      </section>

      <section>
        <label
          htmlFor="notes"
          className="mb-2 block font-sans text-[11px] uppercase tracking-[3px] text-grey"
        >
          Notes (optional)
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-black/15 bg-white p-4 font-sans text-base focus:border-gold focus:outline-none"
        />
      </section>

      <section className="space-y-3">
        <button
          type="button"
          onClick={onEnd}
          disabled={busy || uploading || missingPhotos > 0}
          className={bigButton}
        >
          {busy ? "Ending" : "End shift"}
        </button>
        {missingPhotos > 0 && (
          <p className="font-sans text-sm font-light">
            Add {missingPhotos} more {missingPhotos === 1 ? "photo" : "photos"} to end the shift.
          </p>
        )}
        {error && <p className="font-sans text-sm text-red-600">{error}</p>}
        <p className="font-sans text-xs font-light text-grey">{privacyNote}</p>
      </section>
    </div>
  );
}

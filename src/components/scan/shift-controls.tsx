"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { endShift, startShift } from "@/actions/time-tracking";
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

export function EndShift({ entryId }: { entryId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [, startTransition] = useTransition();

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
    <div className="space-y-5">
      <div>
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
      </div>
      <button type="button" onClick={onEnd} disabled={busy} className={bigButton}>
        {busy ? "Ending" : "End shift"}
      </button>
      {error && <p className="font-sans text-sm text-red-600">{error}</p>}
      <p className="font-sans text-xs font-light text-grey">{privacyNote}</p>
    </div>
  );
}

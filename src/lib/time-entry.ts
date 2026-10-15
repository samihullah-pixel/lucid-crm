import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { distanceMeters } from "@/lib/geo";

/** Standortangabe vom Handy. Wird einmalig beim Start und beim Ende erhoben. */
export type GeoInput =
  | { status: "ok"; lat: number; lng: number; accuracy: number }
  | { status: "denied" | "unavailable" | "timeout" };

export const FLAG = {
  START_OUTSIDE: "START_OUTSIDE",
  START_NO_LOCATION: "START_NO_LOCATION",
  START_UNVERIFIED: "START_UNVERIFIED",
  END_OUTSIDE: "END_OUTSIDE",
  END_NO_LOCATION: "END_NO_LOCATION",
  END_UNVERIFIED: "END_UNVERIFIED",
  TOO_SHORT: "TOO_SHORT",
  TOO_LONG: "TOO_LONG",
  OVERLAPPING_OPEN: "OVERLAPPING_OPEN",
} as const;

/** "Nicht prüfbar" (Objekt ohne Koordinaten) ist ein Hinweis, aber kein Prüf-Grund. */
const INFO_ONLY_FLAGS: string[] = [FLAG.START_UNVERIFIED, FLAG.END_UNVERIFIED];

export function needsReview(flags: string[]): boolean {
  return flags.some((f) => !INFO_ONLY_FLAGS.includes(f));
}

export const FLAG_LABELS: Record<string, string> = {
  START_OUTSIDE: "Start außerhalb des Objekt-Radius",
  START_NO_LOCATION: "Start ohne Standort (verweigert/nicht verfügbar)",
  START_UNVERIFIED: "Start nicht prüfbar (Objekt ohne Koordinaten)",
  END_OUTSIDE: "Ende außerhalb des Objekt-Radius",
  END_NO_LOCATION: "Ende ohne Standort (verweigert/nicht verfügbar)",
  END_UNVERIFIED: "Ende nicht prüfbar (Objekt ohne Koordinaten)",
  TOO_SHORT: "Schicht kürzer als 50 % der Sollzeit",
  TOO_LONG: "Schicht länger als 150 % der Sollzeit",
  OVERLAPPING_OPEN: "Mitarbeiter hatte bereits eine offene Schicht",
};

export type GeoResult = {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  distanceM: number | null;
  flag: string | null;
};

/** Wertet eine Standortangabe gegen das Objekt aus. */
export function evaluateGeo(
  geo: GeoInput,
  property: { latitude: number | null; longitude: number | null; geofenceRadiusM: number },
  kind: "START" | "END"
): GeoResult {
  if (geo.status !== "ok") {
    return {
      lat: null,
      lng: null,
      accuracy: null,
      distanceM: null,
      flag: FLAG[`${kind}_NO_LOCATION`],
    };
  }
  const base = { lat: geo.lat, lng: geo.lng, accuracy: geo.accuracy };
  if (property.latitude == null || property.longitude == null) {
    return { ...base, distanceM: null, flag: FLAG[`${kind}_UNVERIFIED`] };
  }
  const distanceM = Math.round(
    distanceMeters(geo.lat, geo.lng, property.latitude, property.longitude)
  );
  return {
    ...base,
    distanceM,
    flag: distanceM > property.geofenceRadiusM ? FLAG[`${kind}_OUTSIDE`] : null,
  };
}

/** Prüft und bereinigt Standortdaten, die vom Client kommen. */
export function sanitizeGeo(input: unknown): GeoInput {
  const g = input as Partial<{ status: string; lat: number; lng: number; accuracy: number }> | null;
  if (g?.status === "ok") {
    const { lat, lng, accuracy } = g;
    if (
      typeof lat === "number" &&
      typeof lng === "number" &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180
    ) {
      return {
        status: "ok",
        lat,
        lng,
        accuracy: typeof accuracy === "number" && Number.isFinite(accuracy) ? accuracy : 0,
      };
    }
    return { status: "unavailable" };
  }
  if (g?.status === "denied" || g?.status === "timeout") return { status: g.status };
  return { status: "unavailable" };
}

/** Plausibilität der Dauer gegenüber der Sollzeit des Objekts. */
export function durationFlag(minutes: number, targetMinutes: number | null): string | null {
  if (!targetMinutes) return null;
  if (minutes < targetMinutes * 0.5) return FLAG.TOO_SHORT;
  if (minutes > targetMinutes * 1.5) return FLAG.TOO_LONG;
  return null;
}

export function minutesBetween(start: Date, end: Date): number {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, "0")} h`;
}

const TZ = "Europe/Berlin";

export function formatDateTime(d: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatTime(d: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/** Beginn eines Monats (00:00 Uhr Berliner Zeit) als echter Zeitpunkt. */
export function berlinMonthStart(year: number, month: number): Date {
  const guess = new Date(Date.UTC(year, month - 1, 1));
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    })
      .formatToParts(guess)
      .map((x) => [x.type, Number(x.value)])
  );
  const asBerlin = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return new Date(guess.getTime() - (asBerlin - guess.getTime()));
}

export function generateQrToken(): string {
  return randomBytes(16).toString("hex");
}

/** Nächste Nummer im Format S-2026-0001 (Jahr nach Berliner Zeit). */
export async function nextEntryNumber(now: Date): Promise<string> {
  const year = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric" }).format(now);
  const prefix = `S-${year}-`;
  const last = await prisma.timeEntry.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const n = last ? Number(last.number.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(n).padStart(4, "0")}`;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Standort-Zeile für die Admin-Mails. */
export function describeGeo(
  r: { distanceM: number | null; flag: string | null },
  radius: number
): string {
  if (!r.flag) return `Standort ok (${r.distanceM ?? 0} m vom Objekt)`;
  if (r.flag.endsWith("_OUTSIDE")) {
    return `PRÜFEN: ${r.distanceM} m vom Objekt entfernt (erlaubt: ${radius} m)`;
  }
  if (r.flag.endsWith("_NO_LOCATION")) return "PRÜFEN: Standort nicht übermittelt (verweigert oder nicht verfügbar)";
  return "Standort nicht prüfbar (Objekt ohne Koordinaten)";
}

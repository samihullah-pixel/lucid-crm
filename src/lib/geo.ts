/** Abstand zweier Koordinaten in Metern (Haversine). */
export function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Liest "53.5511, 9.9937" (so kopiert Google Maps die Koordinaten) oder
 * deutsche Schreibweise mit Komma als Dezimaltrenner.
 * Leer -> null, unlesbar/außerhalb des Bereichs -> "invalid".
 */
export function parseCoordinates(
  input: string
): { lat: number; lng: number } | null | "invalid" {
  const raw = input.trim();
  if (!raw) return null;
  const parts = raw.includes(";")
    ? raw.split(";")
    : raw.match(/-?\d+[.,]\d+|-?\d+/g) ?? [];
  if (parts.length !== 2) return "invalid";
  const [lat, lng] = parts.map((p) => Number(p.trim().replace(",", ".")));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "invalid";
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return "invalid";
  return { lat, lng };
}

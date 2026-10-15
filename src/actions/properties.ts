"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseCoordinates } from "@/lib/geo";
import { generateQrToken } from "@/lib/time-entry";

function positiveInt(value: FormDataEntryValue | null): number | null {
  const n = Math.round(Number(String(value ?? "").replace(",", ".")));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Felder der QR-Zeiterfassung. Bricht mit Hinweis ab, wenn die Koordinaten unlesbar sind. */
function timeTrackingData(formData: FormData, back: string) {
  const coords = parseCoordinates(String(formData.get("coordinates") ?? ""));
  if (coords === "invalid") {
    redirect(
      back +
        "?flash=" +
        encodeURIComponent('error:Koordinaten nicht erkannt. Beispiel: 53.5511, 9.9937')
    );
  }
  return {
    latitude: coords?.lat ?? null,
    longitude: coords?.lng ?? null,
    geofenceRadiusM: positiveInt(formData.get("geofenceRadiusM")) ?? 150,
    targetMinutes: positiveInt(formData.get("targetMinutes")),
    customerReportEmail: String(formData.get("customerReportEmail") ?? "").trim() || null,
  };
}

function buildPropertyData(formData: FormData) {
  return {
    customerId: String(formData.get("customerId") ?? ""),
    name: String(formData.get("name") ?? ""),
    address: String(formData.get("address") ?? ""),
    postalCode: String(formData.get("postalCode") ?? "") || null,
    city: String(formData.get("city") ?? "") || null,
    contactOnSite: String(formData.get("contactOnSite") ?? "") || null,
    phoneOnSite: String(formData.get("phoneOnSite") ?? "") || null,
    accessType: String(formData.get("accessType") ?? "") || null,
    accessDetails: String(formData.get("accessDetails") ?? "") || null,
    keyNumber: String(formData.get("keyNumber") ?? "") || null,
    hasAlarmSystem: formData.get("hasAlarmSystem") === "on",
    alarmNote: String(formData.get("alarmNote") ?? "") || null,
    parkingInfo: String(formData.get("parkingInfo") ?? "") || null,
    hasElevator: formData.get("hasElevator") === "on",
    floor: String(formData.get("floor") ?? "") || null,
    notes: String(formData.get("notes") ?? "") || null,
  };
}

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function createProperty(formData: FormData) {
  await prisma.property.create({
    data: {
      ...buildPropertyData(formData),
      ...timeTrackingData(formData, "/properties/new"),
      qrToken: generateQrToken(),
    },
  });

  revalidateAll();
  redirect("/properties?flash=" + encodeURIComponent("Objekt angelegt"));
}

export async function updateProperty(id: string, formData: FormData) {
  await prisma.property.update({
    where: { id },
    data: {
      ...buildPropertyData(formData),
      ...timeTrackingData(formData, `/properties/${id}/edit`),
    },
  });

  revalidateAll();
  redirect("/properties?flash=" + encodeURIComponent("Objekt gespeichert"));
}

/** Neues Scan-Token: der alte QR-Code ist sofort wertlos (z. B. nach Abfotografieren). */
export async function regenerateQrToken(id: string) {
  await prisma.property.update({ where: { id }, data: { qrToken: generateQrToken() } });
  revalidatePath(`/properties/${id}/edit`);
}

export async function deleteProperty(id: string) {
  // Zeiteinträge müssen 2 Jahre aufbewahrt werden (§ 17 MiLoG) -> nicht löschbar.
  const entries = await prisma.timeEntry.count({ where: { propertyId: id } });
  if (entries > 0) {
    redirect(
      "/properties?flash=" +
        encodeURIComponent(
          "error:Für dieses Objekt gibt es erfasste Arbeitszeiten (Aufbewahrungspflicht). Es kann nicht gelöscht werden, bitte stattdessen deaktivieren."
        )
    );
  }
  await prisma.property.delete({ where: { id } });
  revalidateAll();
  redirect("/properties");
}

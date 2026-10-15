"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseChecklistText } from "@/lib/checklist";
import { getCurrentEmployee } from "@/lib/employee-session";

/**
 * Speichert die Checkliste eines Objekts. Bestehende Punkte (gleicher Abschnitt
 * und Text) bleiben erhalten, entfernte mit Häkchen-Historie werden archiviert.
 */
export async function saveChecklist(propertyId: string, formData: FormData) {
  const parsed = parseChecklistText(String(formData.get("items") ?? ""));

  const template = await prisma.checklistTemplate.upsert({
    where: { propertyId },
    create: { propertyId },
    update: {},
    include: { items: { where: { archived: false } } },
  });

  const existing = new Map<string, (typeof template.items)[number]>();
  for (const it of template.items) existing.set(`${it.section}\u0000${it.text}`, it);

  const keep = new Set<string>();
  for (const [order, item] of parsed.entries()) {
    const key = `${item.section}\u0000${item.text}`;
    const found = existing.get(key);
    if (found && !keep.has(found.id)) {
      keep.add(found.id);
      if (found.order !== order) {
        await prisma.checklistItem.update({ where: { id: found.id }, data: { order } });
      }
    } else {
      await prisma.checklistItem.create({
        data: { templateId: template.id, section: item.section, text: item.text, order },
      });
    }
  }

  for (const it of template.items) {
    if (keep.has(it.id)) continue;
    const used = await prisma.timeEntryCheck.count({ where: { itemId: it.id } });
    if (used > 0) {
      await prisma.checklistItem.update({ where: { id: it.id }, data: { archived: true } });
    } else {
      await prisma.checklistItem.delete({ where: { id: it.id } });
    }
  }

  revalidatePath(`/properties/${propertyId}/checklist`);
  redirect(`/properties/${propertyId}/checklist?flash=` + encodeURIComponent("Checkliste gespeichert"));
}

async function ownOpenEntry(entryId: string) {
  const employee = await getCurrentEmployee();
  if (!employee) return null;
  const entry = await prisma.timeEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.employeeId !== employee.id || entry.status !== "OPEN") return null;
  return entry;
}

/** Punkt abhaken/abwählen – nur in der eigenen, laufenden Schicht. */
export async function toggleCheck(entryId: string, itemId: string, checked: boolean) {
  const entry = await ownOpenEntry(entryId);
  if (!entry) return { ok: false as const };
  const item = await prisma.checklistItem.findUnique({
    where: { id: itemId },
    include: { template: true },
  });
  if (!item || item.template.propertyId !== entry.propertyId) return { ok: false as const };
  await prisma.timeEntryCheck.upsert({
    where: { timeEntryId_itemId: { timeEntryId: entryId, itemId } },
    create: { timeEntryId: entryId, itemId, checked },
    update: { checked },
  });
  return { ok: true as const };
}

/** Foto zur laufenden Schicht registrieren (Upload ging direkt zu Vercel Blob). */
export async function addPhoto(entryId: string, url: string) {
  const entry = await ownOpenEntry(entryId);
  if (!entry) return { ok: false as const, error: "Shift not found." };
  let valid = false;
  try {
    const u = new URL(url);
    valid =
      u.protocol === "https:" &&
      u.hostname.endsWith(".blob.vercel-storage.com") &&
      u.pathname.startsWith(`/time/${entryId}/`);
  } catch {}
  if (!valid) return { ok: false as const, error: "Invalid photo." };
  const photo = await prisma.timeEntryPhoto.create({ data: { timeEntryId: entryId, url } });
  return { ok: true as const, id: photo.id };
}

export async function removePhoto(entryId: string, photoId: string) {
  const entry = await ownOpenEntry(entryId);
  if (!entry) return { ok: false as const };
  await prisma.timeEntryPhoto.deleteMany({ where: { id: photoId, timeEntryId: entryId } });
  return { ok: true as const };
}

/** Admin: "Prüfen"-Eintrag als durchgesehen markieren. */
export async function markReviewed(entryId: string) {
  await prisma.timeEntry.updateMany({
    where: { id: entryId, status: "REVIEW" },
    data: { status: "DONE", reviewedAt: new Date() },
  });
  revalidatePath("/zeiterfassung", "layout");
}

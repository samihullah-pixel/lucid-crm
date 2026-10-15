"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { buildCustomerReport } from "@/lib/customer-report";

export type ReportResult = { ok: true } | { ok: false; error: string };

/** Lädt den Bericht für die Vorschau und den Versand. Nur erledigte, freigegebene Schichten. */
export async function loadCustomerReport(entryId: string) {
  const entry = await prisma.timeEntry.findUnique({
    where: { id: entryId },
    include: {
      property: { include: { checklistTemplate: { include: { items: { orderBy: { order: "asc" } } } } } },
      checks: { where: { checked: true } },
    },
  });
  if (!entry) return null;

  const checkedIds = new Set(entry.checks.map((c) => c.itemId));
  const doneItems = (entry.property.checklistTemplate?.items ?? [])
    .filter((i) => checkedIds.has(i.id))
    .map((i) => ({ section: i.section, text: i.text }));

  const report = entry.endedAt
    ? buildCustomerReport({
        propertyName: entry.property.name,
        startedAt: entry.startedAt,
        endedAt: entry.endedAt,
        doneItems,
      })
    : null;
  return { entry, report };
}

/**
 * Admin-Freigabe: versendet den Kundenbericht an die beim Objekt hinterlegte
 * Adresse. Nie automatisch, und erst wenn die Schicht nicht mehr auf "Prüfen" steht.
 */
export async function sendCustomerReport(entryId: string): Promise<ReportResult> {
  const loaded = await loadCustomerReport(entryId);
  if (!loaded) return { ok: false, error: "Schicht nicht gefunden." };
  const { entry, report } = loaded;

  const to = entry.property.customerReportEmail;
  if (!to) return { ok: false, error: "Beim Objekt ist keine Kunden-E-Mail hinterlegt." };
  if (entry.status !== "DONE" || !report) {
    return { ok: false, error: "Der Bericht kann erst nach abgeschlossener und geprüfter Schicht gesendet werden." };
  }
  if (entry.customerReportSentAt) return { ok: false, error: "Der Bericht wurde bereits gesendet." };

  const result = await sendEmail({
    to,
    subject: report.subject,
    text: report.text,
    html: report.html,
    replyTo: process.env.OWNER_EMAIL || undefined,
  });
  if (!result.ok) return { ok: false, error: "E-Mail-Versand fehlgeschlagen. Bitte später erneut versuchen." };

  await prisma.timeEntry.update({
    where: { id: entry.id },
    data: { customerReportSentAt: new Date() },
  });
  revalidatePath(`/zeiterfassung/${entry.id}`);
  return { ok: true };
}

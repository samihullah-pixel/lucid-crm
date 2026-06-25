"use server";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendEmail, appBaseUrl } from "@/lib/email";

const OWNER_EMAIL = process.env.OWNER_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? "info@lucid-cleaning.de";

function fmtDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function fmtPrice(price: unknown): string {
  return `${Number(price).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

/** Lädt eine Anfrage inkl. Partner und Objekt/Kunde für E-Mail-Inhalte. */
function loadRequest(id: string) {
  return prisma.subcontractRequest.findUnique({
    where: { id },
    include: { partner: true, property: { include: { customer: true } } },
  });
}

function loadRequestByToken(token: string) {
  return prisma.subcontractRequest.findUnique({
    where: { confirmToken: token },
    include: { partner: true, property: { include: { customer: true } } },
  });
}

type RequestWithRelations = NonNullable<Awaited<ReturnType<typeof loadRequest>>>;

function propertyLocation(req: RequestWithRelations): string {
  const p = req.property;
  return [p.name, p.address, [p.postalCode, p.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
}

/** Anfrage-E-Mail an den Partner (mit festem Preis + Link zur Token-Seite). */
async function sendPartnerRequestEmail(req: RequestWithRelations) {
  const link = `${appBaseUrl()}/auftrag/${req.confirmToken}`;
  const greeting = req.partner.contactPerson ? `Guten Tag ${req.partner.contactPerson},` : "Guten Tag,";
  await sendEmail({
    to: req.partner.email,
    subject: `Terminanfrage – ${req.serviceDescription} am ${fmtDate(req.requestedDate)}`,
    text: `${greeting}

wir möchten Sie mit folgender Leistung beauftragen:

  Leistung:   ${req.serviceDescription}
  Objekt:     ${propertyLocation(req)}
  Wunschtermin: ${fmtDate(req.requestedDate)}
  Vergütung:  ${fmtPrice(req.partnerPrice)} (fest)

Bitte bestätigen Sie den Termin zu den genannten Konditionen – oder schlagen Sie
einen Alternativtermin vor:

${link}

Mit freundlichen Grüßen
Lucid* Cleaning Services`,
  });
}

/** Info-E-Mail an den Kunden (NIEMALS mit Partnerpreis/EK). */
async function sendCustomerInfoEmail(req: RequestWithRelations) {
  const customer = req.property.customer;
  if (!customer.email) return;
  const greeting = customer.contactPerson ? `Guten Tag ${customer.contactPerson},` : "Guten Tag,";
  await sendEmail({
    to: customer.email,
    subject: `Ihr Auftrag: ${req.serviceDescription} am ${fmtDate(req.requestedDate)}`,
    text: `${greeting}

wir freuen uns, Ihnen mitzuteilen, dass folgender Auftrag fest eingeplant ist und
durch unseren Fachpartner ausgeführt wird:

  Leistung: ${req.serviceDescription}
  Objekt:   ${propertyLocation(req)}
  Termin:   ${fmtDate(req.requestedDate)}

Sie müssen nichts weiter veranlassen. Bei Rückfragen sind wir gerne für Sie da.

Mit freundlichen Grüßen
Lucid* Cleaning Services`,
  });
}

/** Benachrichtigung an den Inhaber bei Alternativvorschlag/Ablehnung. */
async function sendOwnerNotification(req: RequestWithRelations, kind: "proposed" | "declined") {
  const link = req.appointmentId
    ? `${appBaseUrl()}/appointments/${req.appointmentId}/edit`
    : `${appBaseUrl()}/appointments`;
  const subject =
    kind === "proposed"
      ? `Partner schlägt Alternativtermin vor – ${req.partner.name}`
      : `Partner hat abgelehnt – ${req.partner.name}`;
  const body =
    kind === "proposed"
      ? `Der Partner ${req.partner.name} schlägt für "${req.serviceDescription}" einen Alternativtermin vor:

  Ursprünglich:   ${fmtDate(req.requestedDate)}
  Vorgeschlagen:  ${req.proposedDate ? fmtDate(req.proposedDate) : "—"}
  ${req.partnerNote ? `Notiz: ${req.partnerNote}` : ""}

Im Termin-Detail übernehmen oder ablehnen:
${link}`
      : `Der Partner ${req.partner.name} hat die Anfrage "${req.serviceDescription}" (${fmtDate(req.requestedDate)}) abgelehnt.
${req.partnerNote ? `Notiz: ${req.partnerNote}` : ""}

${link}`;
  await sendEmail({ to: OWNER_EMAIL, subject, text: body });
}

/**
 * Legt eine Fremdleistungs-Anfrage an und verschickt die Partner-E-Mail.
 * Wird aus dem Termin-Anlegen-Flow aufgerufen (appointments.ts).
 */
export async function createSubcontractForAppointment(input: {
  appointmentId: string | null;
  partnerId: string;
  propertyId: string;
  serviceDescription: string;
  requestedDate: Date;
  partnerPrice: number;
  customerPrice?: number | null;
}) {
  const created = await prisma.subcontractRequest.create({
    data: {
      appointmentId: input.appointmentId,
      partnerId: input.partnerId,
      propertyId: input.propertyId,
      serviceDescription: input.serviceDescription,
      requestedDate: input.requestedDate,
      partnerPrice: input.partnerPrice,
      customerPrice: input.customerPrice ?? null,
      confirmToken: randomUUID(),
      status: "ANGEFRAGT",
    },
  });
  const full = await loadRequest(created.id);
  if (full) await sendPartnerRequestEmail(full);
  return created;
}

/** Partner bestätigt den genannten Termin (keine Preiseingabe). */
export async function confirmSubcontractRequest(token: string) {
  const req = await loadRequestByToken(token);
  if (!req || req.status !== "ANGEFRAGT") return;
  await prisma.subcontractRequest.update({
    where: { id: req.id },
    data: { status: "BESTAETIGT", respondedAt: new Date(), customerNotifiedAt: new Date() },
  });
  const full = await loadRequest(req.id);
  if (full) await sendCustomerInfoEmail(full);
  revalidatePath("/appointments");
}

/** Partner schlägt einen Alternativtermin vor. */
export async function proposeSubcontractDate(token: string, formData: FormData) {
  const req = await loadRequestByToken(token);
  if (!req || req.status !== "ANGEFRAGT") return;
  const proposedRaw = String(formData.get("proposedDate") ?? "");
  if (!proposedRaw) return;
  await prisma.subcontractRequest.update({
    where: { id: req.id },
    data: {
      status: "TERMIN_VORGESCHLAGEN",
      proposedDate: new Date(proposedRaw),
      partnerNote: String(formData.get("note") ?? "") || null,
      respondedAt: new Date(),
    },
  });
  const full = await loadRequest(req.id);
  if (full) await sendOwnerNotification(full, "proposed");
  revalidatePath("/appointments");
}

/** Partner lehnt ab. */
export async function declineSubcontractRequest(token: string, formData: FormData) {
  const req = await loadRequestByToken(token);
  if (!req || req.status !== "ANGEFRAGT") return;
  await prisma.subcontractRequest.update({
    where: { id: req.id },
    data: {
      status: "ABGELEHNT",
      partnerNote: String(formData.get("note") ?? "") || null,
      respondedAt: new Date(),
    },
  });
  const full = await loadRequest(req.id);
  if (full) await sendOwnerNotification(full, "declined");
  revalidatePath("/appointments");
}

/** Inhaber übernimmt den vom Partner vorgeschlagenen Alternativtermin. */
export async function acceptProposedDate(id: string) {
  const req = await loadRequest(id);
  if (!req || req.status !== "TERMIN_VORGESCHLAGEN" || !req.proposedDate) return;
  await prisma.subcontractRequest.update({
    where: { id: req.id },
    data: {
      requestedDate: req.proposedDate,
      status: "BESTAETIGT",
      customerNotifiedAt: new Date(),
    },
  });
  // Termin-Datum im Kalender mitziehen, falls verknüpft.
  if (req.appointmentId) {
    await prisma.appointment.update({
      where: { id: req.appointmentId },
      data: { date: req.proposedDate },
    });
  }
  const full = await loadRequest(req.id);
  if (full) await sendCustomerInfoEmail(full);
  revalidatePath("/appointments");
}

/** Anfrage erneut an den Partner senden (neuer Token, Status zurück auf ANGEFRAGT). */
export async function resendSubcontractRequest(id: string) {
  const req = await loadRequest(id);
  if (!req) return;
  await prisma.subcontractRequest.update({
    where: { id: req.id },
    data: { status: "ANGEFRAGT", confirmToken: randomUUID(), proposedDate: null, respondedAt: null },
  });
  const full = await loadRequest(req.id);
  if (full) await sendPartnerRequestEmail(full);
  revalidatePath("/appointments");
}

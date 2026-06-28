"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/email";

export async function createCustomerSupplyItem(formData: FormData) {
  const customerId = String(formData.get("customerId") ?? "");
  const intervalDays = Number(formData.get("intervalDays") ?? 28);
  const startDate = formData.get("startDate")
    ? new Date(String(formData.get("startDate")))
    : new Date();

  await prisma.customerSupplyItem.create({
    data: {
      customerId,
      productId: String(formData.get("productId") ?? ""),
      quantity: Number(formData.get("quantity") ?? 1),
      intervalDays,
      nextDueAt: startDate,
    },
  });
  revalidatePath(`/customers/${customerId}/supply`);
  redirect(`/customers/${customerId}/supply?flash=` + encodeURIComponent("Position hinzugefügt"));
}

export async function deleteCustomerSupplyItem(id: string, customerId: string) {
  await prisma.customerSupplyItem.delete({ where: { id } });
  revalidatePath(`/customers/${customerId}/supply`);
  redirect(`/customers/${customerId}/supply`);
}

export async function toggleCustomerSupplyItem(id: string, customerId: string) {
  const item = await prisma.customerSupplyItem.findUnique({ where: { id } });
  if (!item) return;
  await prisma.customerSupplyItem.update({
    where: { id },
    data: { active: !item.active },
  });
  revalidatePath(`/customers/${customerId}/supply`);
}

export async function cancelSupplyOrder(id: string) {
  await prisma.supplyOrder.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/supply-orders");
}

/** Firmenname als Absender/Signatur in Bestell-Mails. */
const COMPANY_NAME = process.env.COMPANY_NAME ?? "Lucid* Cleaning Services";

type ManualOrderInput = {
  propertyId: string;
  supplierId: string;
  employeeId?: string | null;
  ccEmail?: string | null;
  note?: string | null;
  items: { productId: string; quantity: number }[];
};

/** Mehrzeilige Lieferadresse aus den Objektdaten. */
function formatDeliveryAddress(p: {
  name: string;
  address: string;
  postalCode: string | null;
  city: string | null;
}): string {
  const cityLine = [p.postalCode, p.city].filter(Boolean).join(" ");
  return [p.name, p.address, cityLine].filter(Boolean).join("\n");
}

/**
 * Manuelle Bestellung durch einen Mitarbeiter:
 * legt die Bestellung an, versendet die E-Mail an den Lieferanten (inkl. CC)
 * mit unserer Kundennummer und der Lieferadresse des gewählten Objekts und
 * markiert die Bestellung als versendet bzw. fehlgeschlagen.
 */
export async function createManualSupplyOrder(input: ManualOrderInput) {
  const items = input.items.filter((i) => i.quantity > 0);
  if (!input.propertyId || !input.supplierId || items.length === 0) {
    throw new Error("Objekt, Lieferant und mindestens ein Artikel sind erforderlich.");
  }

  const [property, supplier, employee, products] = await Promise.all([
    prisma.property.findUnique({
      where: { id: input.propertyId },
      include: { customer: true },
    }),
    prisma.supplier.findUnique({ where: { id: input.supplierId } }),
    input.employeeId
      ? prisma.employee.findUnique({ where: { id: input.employeeId } })
      : Promise.resolve(null),
    prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) }, supplierId: input.supplierId },
    }),
  ]);

  if (!property || !supplier) {
    throw new Error("Objekt oder Lieferant nicht gefunden.");
  }

  const productById = new Map(products.map((p) => [p.id, p]));
  // Nur Artikel übernehmen, die wirklich zu diesem Lieferanten gehören.
  const lineItems = items
    .map((i) => ({ product: productById.get(i.productId), quantity: i.quantity }))
    .filter((l): l is { product: (typeof products)[number]; quantity: number } => Boolean(l.product));

  if (lineItems.length === 0) {
    throw new Error("Keine gültigen Artikel für diesen Lieferanten ausgewählt.");
  }

  // Bestellung zunächst als PENDING anlegen (Beleg existiert auch, falls die Mail klemmt).
  const order = await prisma.supplyOrder.create({
    data: {
      supplierId: supplier.id,
      status: "PENDING",
      source: "MANUAL",
      propertyId: property.id,
      employeeId: employee?.id ?? null,
      ccEmail: input.ccEmail?.trim() || null,
      note: input.note?.trim() || null,
      items: {
        create: lineItems.map((l) => ({
          customerId: property.customerId,
          productId: l.product.id,
          quantity: l.quantity,
          unitPrice: l.product.unitPrice,
        })),
      },
    },
  });

  // --- E-Mail-Inhalt aufbauen ---
  const today = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const deliveryAddress = formatDeliveryAddress(property);
  const orderedBy = employee ? `${employee.firstName} ${employee.lastName}` : null;
  const cc = input.ccEmail?.trim() ? input.ccEmail.trim() : undefined;

  const textRows = lineItems
    .map((l) => `  • ${l.quantity}× ${l.product.name}${l.product.unit ? ` (${l.product.unit})` : ""}`)
    .join("\n");

  const subject = `Bestellung – ${property.name} – ${today}`;

  const text = `Guten Tag,

bitte liefern Sie folgende Artikel:

${textRows}

${supplier.customerNumber ? `Unsere Kundennummer: ${supplier.customerNumber}\n\n` : ""}Lieferadresse:
${deliveryAddress}
${input.note?.trim() ? `\nHinweis: ${input.note.trim()}\n` : ""}
Mit freundlichen Grüßen
${COMPANY_NAME}${orderedBy ? `\n(Bestellung erfasst von ${orderedBy})` : ""}`;

  const htmlRows = lineItems
    .map(
      (l) => `<tr>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;">${l.quantity}×</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;">${escapeHtml(l.product.name)}${l.product.unit ? ` <span style="color:#999;">(${escapeHtml(l.product.unit)})</span>` : ""}</td>
      </tr>`
    )
    .join("");

  const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#080808;line-height:1.6;max-width:560px;">
  <p>Guten Tag,</p>
  <p>bitte liefern Sie folgende Artikel:</p>
  <table style="border-collapse:collapse;width:100%;margin:8px 0 20px;">
    <tbody>${htmlRows}</tbody>
  </table>
  ${supplier.customerNumber ? `<p style="margin:0 0 16px;"><strong>Unsere Kundennummer:</strong> ${escapeHtml(supplier.customerNumber)}</p>` : ""}
  <p style="margin:0 0 4px;"><strong>Lieferadresse</strong></p>
  <p style="margin:0 0 20px;white-space:pre-line;color:#333;">${escapeHtml(deliveryAddress)}</p>
  ${input.note?.trim() ? `<p style="margin:0 0 20px;"><strong>Hinweis:</strong> ${escapeHtml(input.note.trim())}</p>` : ""}
  <p style="margin:0;">Mit freundlichen Grüßen<br>${escapeHtml(COMPANY_NAME)}</p>
  ${orderedBy ? `<p style="margin:8px 0 0;color:#999;font-size:12px;">Bestellung erfasst von ${escapeHtml(orderedBy)}</p>` : ""}
</div>`;

  const result = await sendEmail({
    to: supplier.email,
    ...(cc ? { cc } : {}),
    subject,
    text,
    html,
    ...(property.customer.email ? { replyTo: property.customer.email } : {}),
  });

  await prisma.supplyOrder.update({
    where: { id: order.id },
    data: result.ok
      ? { status: "SENT", sentAt: new Date() }
      : { status: "FAILED" },
  });

  revalidatePath("/supply-orders");

  const flash = result.ok
    ? `Bestellung an ${supplier.name} versendet`
    : `Bestellung gespeichert, aber E-Mail-Versand fehlgeschlagen`;
  redirect("/supply-orders?flash=" + encodeURIComponent(flash));
}

/** Minimales HTML-Escaping für E-Mail-Inhalte. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

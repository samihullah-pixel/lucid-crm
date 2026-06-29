"use server";

import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import { calculateInvoiceAmounts } from "@/lib/invoice-calculation";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createInvoice(formData: FormData) {
  const invoiceNumber = await generateInvoiceNumber();
  const taxRate = Number(formData.get("taxRate") ?? 19);
  const propertyId = String(formData.get("propertyId") ?? "");
  const customerId = String(formData.get("customerId") ?? "");

  // Supply-Items die mitverrechnet werden sollen
  const supplyItemIds = formData.getAll("supplyItemIds").map(String).filter(Boolean);

  // Zusatzarbeiten die mitverrechnet werden sollen
  const extraWorkIds = formData.getAll("extraWorkIds").map(String).filter(Boolean);

  let baseNetAmount = Number(formData.get("netAmount") ?? 0);

  // Preis der Supply-Items aufaddieren
  let supplyItems: Array<{ id: string; productId: string; quantity: number; unitPrice: number; product: { name: string; unit: string | null } }> = [];
  if (supplyItemIds.length > 0) {
    supplyItems = await prisma.supplyOrderItem.findMany({
      where: { id: { in: supplyItemIds }, billed: false },
      include: { product: { select: { name: true, unit: true } } },
    }) as any;
    const supplyTotal = supplyItems.reduce((sum, i) => sum + i.quantity * Number(i.unitPrice), 0);
    baseNetAmount = Math.round((baseNetAmount + supplyTotal) * 100) / 100;
  }

  // Preis der Zusatzarbeiten aufaddieren
  let extraWorks: Array<{
    id: string;
    description: string;
    date: Date;
    billingType: "STUNDENSATZ" | "PAUSCHAL";
    hours: number | null;
    hourlyRate: number | null;
    flatRatePrice: number | null;
  }> = [];
  if (extraWorkIds.length > 0) {
    extraWorks = (await prisma.extraWork.findMany({
      where: { id: { in: extraWorkIds }, alreadyInvoiced: false, billable: true },
    })) as any;
    const extraTotal = extraWorks.reduce((sum, e) => sum + extraWorkAmount(e), 0);
    baseNetAmount = Math.round((baseNetAmount + extraTotal) * 100) / 100;
  }

  const { taxAmount, grossAmount } = calculateInvoiceAmounts(baseNetAmount, taxRate);

  const invoice = await prisma.invoice.create({
    data: {
      customerId,
      propertyId: propertyId || null,
      invoiceNumber,
      invoiceDate: new Date(String(formData.get("invoiceDate") ?? "")),
      servicePeriodFrom: new Date(String(formData.get("servicePeriodFrom") ?? "")),
      servicePeriodTo: new Date(String(formData.get("servicePeriodTo") ?? "")),
      netAmount: baseNetAmount,
      taxRate,
      taxAmount,
      grossAmount,
      status: String(formData.get("status") ?? "ENTWURF") as any,
      notes: String(formData.get("notes") ?? "") || null,
      items: supplyItems.length > 0 || extraWorks.length > 0 ? {
        create: [
          ...extraWorks.map((e, idx) => ({
            type: "ZUSATZARBEIT" as const,
            description: `${e.description} (${e.date.toLocaleDateString("de-DE")})`,
            quantity: e.billingType === "STUNDENSATZ" && e.hours != null ? Number(e.hours) : null,
            unit: e.billingType === "STUNDENSATZ" ? "Std" : null,
            unitPrice: e.billingType === "STUNDENSATZ" && e.hourlyRate != null ? Number(e.hourlyRate) : null,
            totalPrice: extraWorkAmount(e),
            sortOrder: 50 + idx,
          })),
          ...supplyItems.map((i, idx) => ({
            type: "VERBRAUCHSMATERIAL" as const,
            description: `${i.product.name}${i.product.unit ? ` (${i.product.unit})` : ""}`,
            quantity: i.quantity,
            unit: i.product.unit ?? "Stk",
            unitPrice: Number(i.unitPrice),
            totalPrice: Math.round(i.quantity * Number(i.unitPrice) * 100) / 100,
            sortOrder: 100 + idx,
          })),
        ],
      } : undefined,
    },
  });

  // Zusatzarbeiten als abgerechnet markieren und mit Rechnung verknüpfen
  if (extraWorks.length > 0) {
    await prisma.extraWork.updateMany({
      where: { id: { in: extraWorks.map((e) => e.id) }, alreadyInvoiced: false },
      data: { alreadyInvoiced: true, invoiceId: invoice.id },
    });
  }

  // Supply-Items als verrechnet markieren
  if (supplyItemIds.length > 0) {
    await prisma.supplyOrderItem.updateMany({
      where: { id: { in: supplyItemIds }, billed: false },
      data: { billed: true, invoiceId: invoice.id },
    });
  }

  revalidatePath("/invoices");
  redirect("/invoices?flash=" + encodeURIComponent("Rechnung erstellt"));
}

function extraWorkAmount(e: {
  billingType: "STUNDENSATZ" | "PAUSCHAL";
  hours: number | null;
  hourlyRate: number | null;
  flatRatePrice: number | null;
}): number {
  if (e.billingType === "PAUSCHAL") {
    return Math.round(Number(e.flatRatePrice ?? 0) * 100) / 100;
  }
  return Math.round(Number(e.hours ?? 0) * Number(e.hourlyRate ?? 0) * 100) / 100;
}

export async function deleteInvoice(id: string) {
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/invoices");
  redirect("/invoices");
}

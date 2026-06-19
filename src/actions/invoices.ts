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
      items: supplyItems.length > 0 ? {
        create: supplyItems.map((i, idx) => ({
          type: "VERBRAUCHSMATERIAL" as const,
          description: `${i.product.name}${i.product.unit ? ` (${i.product.unit})` : ""}`,
          quantity: i.quantity,
          unit: i.product.unit ?? "Stk",
          unitPrice: Number(i.unitPrice),
          totalPrice: Math.round(i.quantity * Number(i.unitPrice) * 100) / 100,
          sortOrder: 100 + idx,
        })),
      } : undefined,
    },
  });

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

export async function deleteInvoice(id: string) {
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/invoices");
  redirect("/invoices");
}

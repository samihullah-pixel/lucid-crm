"use server";

import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import { calculateInvoiceAmounts } from "@/lib/invoice-calculation";
import { redirect } from "next/navigation";

export async function createInvoice(formData: FormData) {
  const invoiceNumber = await generateInvoiceNumber();
  const netAmount = Number(formData.get("netAmount") ?? 0);
  const taxRate = Number(formData.get("taxRate") ?? 19);
  const { taxAmount, grossAmount } = calculateInvoiceAmounts(netAmount, taxRate);
  const propertyId = String(formData.get("propertyId") ?? "");

  await prisma.invoice.create({
    data: {
      customerId: String(formData.get("customerId") ?? ""),
      propertyId: propertyId || null,
      invoiceNumber,
      invoiceDate: new Date(String(formData.get("invoiceDate") ?? "")),
      servicePeriodFrom: new Date(String(formData.get("servicePeriodFrom") ?? "")),
      servicePeriodTo: new Date(String(formData.get("servicePeriodTo") ?? "")),
      netAmount,
      taxRate,
      taxAmount,
      grossAmount,
      status: String(formData.get("status") ?? "ENTWURF") as any,
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  redirect("/invoices");
}

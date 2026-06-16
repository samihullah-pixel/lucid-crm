"use server";

import { prisma } from "@/lib/prisma";
import { generateCustomerNumber } from "@/lib/customer-number";
import { redirect } from "next/navigation";

function buildCustomerData(formData: FormData) {
  return {
    companyName: String(formData.get("companyName") ?? ""),
    contactPerson: String(formData.get("contactPerson") ?? "") || null,
    email: String(formData.get("email") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
    billingAddress: String(formData.get("billingAddress") ?? "") || null,
    postalCode: String(formData.get("postalCode") ?? "") || null,
    city: String(formData.get("city") ?? "") || null,
    paymentTermsDays: Number(formData.get("paymentTermsDays") ?? 14),
    notes: String(formData.get("notes") ?? "") || null,
  };
}

export async function createCustomer(formData: FormData) {
  const customerNumber = await generateCustomerNumber();

  await prisma.customer.create({
    data: {
      customerNumber,
      ...buildCustomerData(formData),
    },
  });

  redirect("/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
  await prisma.customer.update({
    where: { id },
    data: buildCustomerData(formData),
  });

  redirect("/customers");
}

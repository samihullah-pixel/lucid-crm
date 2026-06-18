"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
  redirect(`/customers/${customerId}/supply`);
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

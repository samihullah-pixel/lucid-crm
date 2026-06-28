"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSupplier(formData: FormData) {
  await prisma.supplier.create({
    data: {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? "") || null,
      customerNumber: String(formData.get("customerNumber") ?? "") || null,
      defaultCc: String(formData.get("defaultCc") ?? "") || null,
      notes: String(formData.get("notes") ?? "") || null,
    },
  });
  revalidatePath("/suppliers");
  redirect("/suppliers?flash=" + encodeURIComponent("Lieferant angelegt"));
}

export async function updateSupplier(id: string, formData: FormData) {
  await prisma.supplier.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? "") || null,
      customerNumber: String(formData.get("customerNumber") ?? "") || null,
      defaultCc: String(formData.get("defaultCc") ?? "") || null,
      notes: String(formData.get("notes") ?? "") || null,
    },
  });
  revalidatePath("/suppliers");
  redirect("/suppliers?flash=" + encodeURIComponent("Lieferant gespeichert"));
}

export async function deleteSupplier(id: string) {
  await prisma.supplier.delete({ where: { id } });
  revalidatePath("/suppliers");
  redirect("/suppliers");
}

export async function createProduct(supplierId: string, formData: FormData) {
  await prisma.product.create({
    data: {
      supplierId,
      name: String(formData.get("name") ?? ""),
      unit: String(formData.get("unit") ?? "") || null,
      unitPrice: Number(formData.get("unitPrice") ?? 0),
      imageUrl: String(formData.get("imageUrl") ?? "") || null,
    },
  });
  revalidatePath("/suppliers");
  redirect(`/suppliers/${supplierId}/edit?flash=` + encodeURIComponent("Produkt angelegt"));
}

/** Foto eines bestehenden Artikels setzen oder entfernen (leerer String = entfernen). */
export async function setProductImage(id: string, supplierId: string, imageUrl: string) {
  await prisma.product.update({
    where: { id },
    data: { imageUrl: imageUrl || null },
  });
  revalidatePath(`/suppliers/${supplierId}/edit`);
}

export async function deleteProduct(id: string, supplierId: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/suppliers");
  redirect(`/suppliers/${supplierId}/edit`);
}

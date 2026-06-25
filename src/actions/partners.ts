"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function buildPartnerData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    contactPerson: String(formData.get("contactPerson") ?? "") || null,
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? "") || null,
    serviceArea: String(formData.get("serviceArea") ?? "") || null,
    notes: String(formData.get("notes") ?? "") || null,
  };
}

export async function createPartner(formData: FormData) {
  await prisma.partner.create({ data: buildPartnerData(formData) });
  revalidatePath("/partners");
  redirect("/partners?flash=" + encodeURIComponent("Partner angelegt"));
}

export async function updatePartner(id: string, formData: FormData) {
  await prisma.partner.update({
    where: { id },
    data: { ...buildPartnerData(formData), isActive: formData.get("isActive") === "on" },
  });
  revalidatePath("/partners");
  redirect("/partners?flash=" + encodeURIComponent("Partner gespeichert"));
}

export async function deletePartner(id: string) {
  await prisma.partner.delete({ where: { id } });
  revalidatePath("/partners");
  redirect("/partners");
}

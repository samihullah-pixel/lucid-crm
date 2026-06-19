"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function createSite(formData: FormData) {
  await prisma.site.create({
    data: {
      name: String(formData.get("name") ?? ""),
      shortName: String(formData.get("shortName") ?? ""),
      color: String(formData.get("color") ?? "") || null,
      address: String(formData.get("address") ?? "") || null,
      notes: String(formData.get("notes") ?? "") || null,
      sortOrder: Number(formData.get("sortOrder") ?? 0),
      isActive: formData.get("isActive") !== "off",
    },
  });

  revalidateAll();
  redirect("/sites?flash=" + encodeURIComponent("Standort angelegt"));
}

export async function updateSite(id: string, formData: FormData) {
  await prisma.site.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? ""),
      shortName: String(formData.get("shortName") ?? ""),
      color: String(formData.get("color") ?? "") || null,
      address: String(formData.get("address") ?? "") || null,
      notes: String(formData.get("notes") ?? "") || null,
      sortOrder: Number(formData.get("sortOrder") ?? 0),
      isActive: formData.get("isActive") === "on",
    },
  });

  revalidateAll();
  redirect("/sites?flash=" + encodeURIComponent("Standort gespeichert"));
}

export async function deleteSite(id: string) {
  await prisma.site.delete({ where: { id } });
  revalidateAll();
  redirect("/sites");
}

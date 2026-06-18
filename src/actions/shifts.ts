"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function createShift(formData: FormData) {
  const siteId = String(formData.get("siteId") ?? "");
  const weekdays = formData.getAll("weekdays").map(Number).filter((n) => !isNaN(n));

  await prisma.shift.create({
    data: {
      siteId,
      name: String(formData.get("name") ?? ""),
      startTime: String(formData.get("startTime") ?? ""),
      endTime: String(formData.get("endTime") ?? ""),
      requiredStaff: Number(formData.get("requiredStaff") ?? 1),
      weekdays,
      validFrom: new Date(String(formData.get("validFrom") ?? "")),
      validUntil: formData.get("validUntil")
        ? new Date(String(formData.get("validUntil")))
        : null,
      sortOrder: Number(formData.get("sortOrder") ?? 0),
      isActive: formData.get("isActive") !== "off",
    },
  });

  revalidateAll();
}

export async function updateShift(id: string, formData: FormData) {
  const weekdays = formData.getAll("weekdays").map(Number).filter((n) => !isNaN(n));

  await prisma.shift.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? ""),
      startTime: String(formData.get("startTime") ?? ""),
      endTime: String(formData.get("endTime") ?? ""),
      requiredStaff: Number(formData.get("requiredStaff") ?? 1),
      weekdays,
      validFrom: new Date(String(formData.get("validFrom") ?? "")),
      validUntil: formData.get("validUntil")
        ? new Date(String(formData.get("validUntil")))
        : null,
      sortOrder: Number(formData.get("sortOrder") ?? 0),
      isActive: formData.get("isActive") === "on",
    },
  });

  revalidateAll();
}

export async function deleteShift(id: string) {
  await prisma.shift.delete({ where: { id } });
  revalidateAll();
}

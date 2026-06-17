"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function buildPropertyData(formData: FormData) {
  return {
    customerId: String(formData.get("customerId") ?? ""),
    name: String(formData.get("name") ?? ""),
    address: String(formData.get("address") ?? ""),
    postalCode: String(formData.get("postalCode") ?? "") || null,
    city: String(formData.get("city") ?? "") || null,
    contactOnSite: String(formData.get("contactOnSite") ?? "") || null,
    phoneOnSite: String(formData.get("phoneOnSite") ?? "") || null,
    accessType: String(formData.get("accessType") ?? "") || null,
    accessDetails: String(formData.get("accessDetails") ?? "") || null,
    keyNumber: String(formData.get("keyNumber") ?? "") || null,
    hasAlarmSystem: formData.get("hasAlarmSystem") === "on",
    alarmNote: String(formData.get("alarmNote") ?? "") || null,
    parkingInfo: String(formData.get("parkingInfo") ?? "") || null,
    hasElevator: formData.get("hasElevator") === "on",
    floor: String(formData.get("floor") ?? "") || null,
    notes: String(formData.get("notes") ?? "") || null,
  };
}

export async function createProperty(formData: FormData) {
  await prisma.property.create({
    data: buildPropertyData(formData),
  });

  revalidatePath("/properties");
  redirect("/properties");
}

export async function updateProperty(id: string, formData: FormData) {
  await prisma.property.update({
    where: { id },
    data: buildPropertyData(formData),
  });

  revalidatePath("/properties");
  redirect("/properties");
}

export async function deleteProperty(id: string) {
  await prisma.property.delete({ where: { id } });
  revalidatePath("/properties");
  redirect("/properties");
}

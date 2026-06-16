"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createExtraWork(formData: FormData) {
  await prisma.extraWork.create({
    data: {
      customerId: String(formData.get("customerId") ?? ""),
      propertyId: String(formData.get("propertyId") ?? ""),
      date: new Date(String(formData.get("date") ?? "")),
      description: String(formData.get("description") ?? ""),
      billingType: String(formData.get("billingType") ?? "STUNDENSATZ") as any,
      hours: formData.get("hours") ? Number(formData.get("hours")) : null,
      hourlyRate: formData.get("hourlyRate") ? Number(formData.get("hourlyRate")) : null,
      flatRatePrice: formData.get("flatRatePrice")
        ? Number(formData.get("flatRatePrice"))
        : null,
      customerApproved: formData.get("customerApproved") === "on",
      billable: formData.get("billable") === "on",
    },
  });

  redirect("/extra-works");
}

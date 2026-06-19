"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function buildCleaningJobData(formData: FormData) {
  const employeeIdRaw = String(formData.get("employeeId") ?? "");

  return {
    customerId: String(formData.get("customerId") ?? ""),
    propertyId: String(formData.get("propertyId") ?? ""),
    employeeId: employeeIdRaw || null,
    date: new Date(String(formData.get("date") ?? "")),
    startTime: String(formData.get("startTime") ?? "") || null,
    endTime: String(formData.get("endTime") ?? "") || null,
    workedHours: formData.get("workedHours")
      ? Number(formData.get("workedHours"))
      : null,
    serviceType: String(formData.get("serviceType") ?? "UNTERHALTSREINIGUNG") as any,
    note: String(formData.get("note") ?? "") || null,
    status: String(formData.get("status") ?? "GEPLANT") as any,
    billable: formData.get("billable") === "on",
  };
}

export async function createCleaningJob(formData: FormData) {
  await prisma.cleaningJob.create({
    data: buildCleaningJobData(formData),
  });

  revalidatePath("/cleaning-jobs");
  redirect("/cleaning-jobs?flash=" + encodeURIComponent("Einsatz angelegt"));
}

export async function updateCleaningJob(id: string, formData: FormData) {
  await prisma.cleaningJob.update({
    where: { id },
    data: buildCleaningJobData(formData),
  });

  revalidatePath("/cleaning-jobs");
  redirect("/cleaning-jobs?flash=" + encodeURIComponent("Einsatz gespeichert"));
}

export async function deleteCleaningJob(id: string) {
  await prisma.cleaningJob.delete({ where: { id } });
  revalidatePath("/cleaning-jobs");
  redirect("/cleaning-jobs");
}

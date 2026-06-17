"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function buildAppointmentData(formData: FormData) {
  const weekdays = formData.getAll("weekdays").map(Number).filter((n) => !isNaN(n));
  const employeeIdRaw = String(formData.get("employeeId") ?? "");
  const startDateRaw = String(formData.get("startDate") ?? "");
  const dateRaw = String(formData.get("date") ?? "");

  return {
    propertyId: String(formData.get("propertyId") ?? ""),
    title: String(formData.get("title") ?? ""),
    intervalType: String(formData.get("intervalType") ?? "EINMALIG") as any,
    weekdays,
    date: dateRaw ? new Date(dateRaw) : null,
    startDate: startDateRaw ? new Date(startDateRaw) : null,
    employeeId: employeeIdRaw || null,
    startTime: String(formData.get("startTime") ?? "") || null,
    endTime: String(formData.get("endTime") ?? "") || null,
    standardHours: formData.get("standardHours")
      ? Number(formData.get("standardHours"))
      : null,
  };
}

export async function createAppointment(formData: FormData) {
  await prisma.appointment.create({
    data: buildAppointmentData(formData),
  });

  revalidatePath("/appointments");
  redirect("/appointments");
}

export async function updateAppointment(id: string, formData: FormData) {
  await prisma.appointment.update({
    where: { id },
    data: buildAppointmentData(formData),
  });

  revalidatePath("/appointments");
  redirect("/appointments");
}

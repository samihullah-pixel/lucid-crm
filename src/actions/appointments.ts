"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSubcontractForAppointment } from "@/actions/subcontract";

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
  const data = buildAppointmentData(formData);
  const appointment = await prisma.appointment.create({ data });

  let flash = "Termin angelegt";

  // Fremdleistung / Subunternehmer: Anfrage an externen Partner auslösen.
  if (formData.get("externalService") === "on") {
    const partnerId = String(formData.get("partnerId") ?? "");
    const partnerPriceRaw = String(formData.get("partnerPrice") ?? "");
    const requestedDate = data.date ?? data.startDate ?? new Date();
    if (partnerId && partnerPriceRaw) {
      await createSubcontractForAppointment({
        appointmentId: appointment.id,
        partnerId,
        propertyId: data.propertyId,
        serviceDescription: String(formData.get("serviceDescription") ?? "") || data.title,
        requestedDate,
        partnerPrice: Number(partnerPriceRaw),
        customerPrice: formData.get("customerPrice") ? Number(formData.get("customerPrice")) : null,
      });
      flash = "Termin angelegt & Anfrage an Partner gesendet";
    }
  }

  revalidatePath("/appointments");
  redirect("/appointments?flash=" + encodeURIComponent(flash));
}

export async function updateAppointment(id: string, formData: FormData) {
  await prisma.appointment.update({
    where: { id },
    data: buildAppointmentData(formData),
  });

  revalidatePath("/appointments");
  redirect("/appointments?flash=" + encodeURIComponent("Termin gespeichert"));
}

export async function deleteAppointment(id: string) {
  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/appointments");
  redirect("/appointments");
}

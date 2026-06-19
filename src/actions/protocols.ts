"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function revalidateAll() {
  revalidatePath("/", "layout");
}

function getMonday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export async function createProtocol(formData: FormData) {
  const templateId = String(formData.get("templateId") ?? "");
  const weekStartStr = String(formData.get("weekStart") ?? "");

  if (!templateId || !weekStartStr) return;

  const weekStart = getMonday(new Date(weekStartStr));

  const template = await prisma.inspectionTemplate.findUnique({
    where: { id: templateId },
    include: {
      areas: {
        orderBy: { order: "asc" },
        include: { items: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!template) return;

  let sortOrder = 0;
  const checks = template.areas.flatMap((area) =>
    area.items.map((item) => ({
      areaName: area.name,
      itemLabel: item.label,
      checked: false,
      sortOrder: sortOrder++,
    }))
  );

  const protocol = await prisma.inspectionProtocol.create({
    data: {
      templateId,
      siteId: template.siteId,
      weekStart,
      checks: { create: checks },
    },
  });

  revalidateAll();
  redirect(`/protokolle/${protocol.id}?flash=` + encodeURIComponent("Kontrolle angelegt"));
}

export async function toggleCheck(formData: FormData) {
  const checkId = String(formData.get("checkId") ?? "");
  const checked = formData.get("checked") === "true";

  if (!checkId) return;

  await prisma.inspectionCheck.update({
    where: { id: checkId },
    data: {
      checked,
      checkedAt: checked ? new Date() : null,
    },
  });

  revalidateAll();
}

export async function updateCheckNote(formData: FormData) {
  const checkId = String(formData.get("checkId") ?? "");
  const note = String(formData.get("note") ?? "");

  if (!checkId) return;

  await prisma.inspectionCheck.update({
    where: { id: checkId },
    data: { note: note || null },
  });

  revalidateAll();
}

export async function updateCheckRating(formData: FormData) {
  const checkId = String(formData.get("checkId") ?? "");
  const rating = Number(formData.get("rating") ?? 0);

  if (!checkId) return;

  await prisma.inspectionCheck.update({
    where: { id: checkId },
    data: { rating: rating || null },
  });

  revalidateAll();
}

export async function completeProtocol(formData: FormData) {
  const protocolId = String(formData.get("protocolId") ?? "");
  const employeeId = String(formData.get("employeeId") ?? "") || null;
  const notes = String(formData.get("notes") ?? "") || null;

  if (!protocolId) return;

  await prisma.inspectionProtocol.update({
    where: { id: protocolId },
    data: {
      status: "ABGESCHLOSSEN",
      completedAt: new Date(),
      employeeId,
      notes,
    },
  });

  revalidateAll();
  redirect("/protokolle?flash=" + encodeURIComponent("Kontrolle abgeschlossen"));
}

export async function reopenProtocol(formData: FormData) {
  const protocolId = String(formData.get("protocolId") ?? "");
  if (!protocolId) return;

  await prisma.inspectionProtocol.update({
    where: { id: protocolId },
    data: {
      status: "IN_BEARBEITUNG",
      completedAt: null,
    },
  });

  revalidateAll();
}

export async function deleteProtocol(id: string) {
  await prisma.inspectionProtocol.delete({ where: { id } });
  revalidateAll();
  redirect("/protokolle");
}

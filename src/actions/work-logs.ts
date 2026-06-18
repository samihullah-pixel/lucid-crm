"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function createWorkLog(formData: FormData) {
  const templateId = String(formData.get("templateId") ?? "");
  const dateStr = String(formData.get("date") ?? "");

  if (!templateId || !dateStr) return;

  const date = new Date(dateStr);

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
  const entries = template.areas.flatMap((area) =>
    area.items.map((item) => ({
      areaName: area.name,
      itemLabel: item.label,
      checked: false,
      sortOrder: sortOrder++,
    }))
  );

  const workLog = await prisma.workLog.create({
    data: {
      templateId,
      siteId: template.siteId!,
      date,
      entries: { create: entries },
    },
  });

  revalidateAll();
  redirect(`/arbeitsprotokoll/${workLog.id}`);
}

export async function toggleWorkLogEntry(formData: FormData) {
  const entryId = String(formData.get("entryId") ?? "");
  const checked = formData.get("checked") === "true";
  const employeeId = String(formData.get("employeeId") ?? "") || null;

  if (!entryId) return;

  await prisma.workLogEntry.update({
    where: { id: entryId },
    data: {
      checked,
      checkedAt: checked ? new Date() : null,
      employeeId: checked ? employeeId : null,
    },
  });

  revalidateAll();
}

export async function completeWorkLog(formData: FormData) {
  const workLogId = String(formData.get("workLogId") ?? "");
  const notes = String(formData.get("notes") ?? "") || null;

  if (!workLogId) return;

  await prisma.workLog.update({
    where: { id: workLogId },
    data: {
      status: "ABGESCHLOSSEN",
      completedAt: new Date(),
      notes,
    },
  });

  revalidateAll();
  redirect("/arbeitsprotokoll");
}

export async function reopenWorkLog(formData: FormData) {
  const workLogId = String(formData.get("workLogId") ?? "");
  if (!workLogId) return;

  await prisma.workLog.update({
    where: { id: workLogId },
    data: {
      status: "OFFEN",
      completedAt: null,
    },
  });

  revalidateAll();
}

export async function deleteWorkLog(id: string) {
  await prisma.workLog.delete({ where: { id } });
  revalidateAll();
  redirect("/arbeitsprotokoll");
}

"use server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createInspectionTemplate(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const propertyId = String(formData.get("propertyId") ?? "").trim() || null;
  if (!name) return;
  const template = await prisma.inspectionTemplate.create({
    data: { name, propertyId },
  });
  revalidatePath("/inspection-templates");
  redirect(`/inspection-templates/${template.id}/edit`);
}

export async function updateInspectionTemplateMeta(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const propertyId = String(formData.get("propertyId") ?? "").trim() || null;
  await prisma.inspectionTemplate.update({ where: { id }, data: { name, propertyId } });
  revalidatePath("/inspection-templates");
  redirect("/inspection-templates");
}

export async function deleteInspectionTemplate(id: string) {
  await prisma.inspectionTemplate.delete({ where: { id } });
  revalidatePath("/inspection-templates");
  redirect("/inspection-templates");
}

export async function saveInspectionAreas(
  templateId: string,
  areas: { id?: string; name: string; order: number; items: { id?: string; label: string; interval: string; durationMinutes: number | null; order: number }[] }[]
) {
  await prisma.$transaction(async (tx) => {
    const existingAreas = await tx.inspectionArea.findMany({ where: { templateId }, select: { id: true } });
    const incomingAreaIds = areas.map((a) => a.id).filter(Boolean) as string[];
    const toDeleteAreaIds = existingAreas.map((a) => a.id).filter((id) => !incomingAreaIds.includes(id));
    if (toDeleteAreaIds.length) {
      await tx.inspectionArea.deleteMany({ where: { id: { in: toDeleteAreaIds } } });
    }
    for (const area of areas) {
      let areaId = area.id;
      if (areaId) {
        await tx.inspectionArea.update({ where: { id: areaId }, data: { name: area.name, order: area.order } });
      } else {
        const created = await tx.inspectionArea.create({ data: { templateId, name: area.name, order: area.order } });
        areaId = created.id;
      }
      const existingItems = await tx.inspectionItem.findMany({ where: { areaId }, select: { id: true } });
      const incomingItemIds = area.items.map((i) => i.id).filter(Boolean) as string[];
      const toDeleteItemIds = existingItems.map((i) => i.id).filter((id) => !incomingItemIds.includes(id));
      if (toDeleteItemIds.length) {
        await tx.inspectionItem.deleteMany({ where: { id: { in: toDeleteItemIds } } });
      }
      for (const item of area.items) {
        if (item.id) {
          await tx.inspectionItem.update({ where: { id: item.id }, data: { label: item.label, interval: item.interval, durationMinutes: item.durationMinutes, order: item.order } });
        } else {
          await tx.inspectionItem.create({ data: { areaId: areaId!, label: item.label, interval: item.interval, durationMinutes: item.durationMinutes, order: item.order } });
        }
      }
    }
  });
  revalidatePath("/inspection-templates");
  redirect("/inspection-templates");
}

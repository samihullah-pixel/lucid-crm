"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { StepMediaType } from "@prisma/client";
import { getTemplate } from "@/lib/sop-templates";

export async function createProcedure(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!name) redirect("/sop-procedures/new");
  const proc = await prisma.procedure.create({ data: { name, description } });
  revalidatePath("/sop-procedures");
  redirect(`/sop-procedures/${proc.id}/edit?flash=` + encodeURIComponent("Anleitung angelegt"));
}

export async function createProcedureFromTemplate(formData: FormData) {
  const templateId = String(formData.get("templateId") ?? "");
  const tpl = getTemplate(templateId);
  if (!tpl) redirect("/sop-procedures/new");

  const proc = await prisma.procedure.create({
    data: {
      name: tpl.name,
      description: tpl.description,
      serviceType: tpl.serviceType,
      steps: {
        create: tpl.steps.map((s, i) => ({
          section: s.section ?? null,
          title: s.title,
          body: s.body ?? null,
          tip: s.tip ?? null,
          warning: s.warning ?? null,
          requiresCheck: s.requiresCheck ?? false,
          order: i,
        })),
      },
    },
  });

  // Equipment anlegen (vorhandene per Name wiederverwenden) und verknüpfen.
  for (let i = 0; i < tpl.equipment.length; i++) {
    const e = tpl.equipment[i];
    const item =
      (await prisma.equipmentItem.findFirst({ where: { name: e.name } })) ??
      (await prisma.equipmentItem.create({
        data: { name: e.name, defaultLocation: e.defaultLocation ?? null },
      }));
    await prisma.procedureEquipment.create({
      data: {
        procedureId: proc.id,
        equipmentId: item.id,
        locationNote: e.defaultLocation ?? null,
        order: i,
      },
    });
  }

  revalidatePath("/sop-procedures");
  redirect(
    `/sop-procedures/${proc.id}/edit?flash=` +
      encodeURIComponent(`Anleitung aus Vorlage „${tpl.label}" erstellt`)
  );
}

export async function updateProcedureMeta(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  await prisma.procedure.update({ where: { id }, data: { name, description } });
  revalidatePath("/sop-procedures");
}

export async function deleteProcedure(id: string) {
  await prisma.procedure.delete({ where: { id } });
  revalidatePath("/sop-procedures");
  redirect("/sop-procedures?flash=" + encodeURIComponent("Anleitung gelöscht"));
}

export async function createEquipmentItem(name: string, defaultLocation: string | null) {
  const item = await prisma.equipmentItem.create({
    data: { name: name.trim(), defaultLocation: defaultLocation?.trim() || null },
  });
  return { id: item.id, name: item.name, defaultLocation: item.defaultLocation };
}

type StepInput = {
  id?: string;
  section: string | null;
  title: string;
  body: string | null;
  tip: string | null;
  warning: string | null;
  requiresCheck: boolean;
  mediaUrl: string | null;
  mediaType: StepMediaType;
  order: number;
};

type EquipmentInput = {
  id?: string;
  equipmentId: string;
  locationNote: string | null;
  order: number;
};

export async function saveProcedure(
  id: string,
  steps: StepInput[],
  equipment: EquipmentInput[]
) {
  await prisma.$transaction(async (tx) => {
    // Steps — replace-all
    const existingSteps = await tx.procedureStep.findMany({
      where: { procedureId: id },
      select: { id: true },
    });
    const incomingStepIds = steps.map((s) => s.id).filter(Boolean) as string[];
    const stepsToDelete = existingSteps
      .map((s) => s.id)
      .filter((sid) => !incomingStepIds.includes(sid));
    if (stepsToDelete.length) {
      await tx.procedureStep.deleteMany({ where: { id: { in: stepsToDelete } } });
    }
    for (const s of steps) {
      const data = {
        section: s.section,
        title: s.title,
        body: s.body,
        tip: s.tip,
        warning: s.warning,
        requiresCheck: s.requiresCheck,
        mediaUrl: s.mediaUrl,
        mediaType: s.mediaType,
        order: s.order,
      };
      if (s.id) {
        await tx.procedureStep.update({ where: { id: s.id }, data });
      } else {
        await tx.procedureStep.create({ data: { ...data, procedureId: id } });
      }
    }

    // Equipment links — replace-all
    const existingEq = await tx.procedureEquipment.findMany({
      where: { procedureId: id },
      select: { id: true },
    });
    const incomingEqIds = equipment.map((e) => e.id).filter(Boolean) as string[];
    const eqToDelete = existingEq
      .map((e) => e.id)
      .filter((eid) => !incomingEqIds.includes(eid));
    if (eqToDelete.length) {
      await tx.procedureEquipment.deleteMany({ where: { id: { in: eqToDelete } } });
    }
    for (const e of equipment) {
      if (e.id) {
        await tx.procedureEquipment.update({
          where: { id: e.id },
          data: { equipmentId: e.equipmentId, locationNote: e.locationNote, order: e.order },
        });
      } else {
        await tx.procedureEquipment.create({
          data: {
            procedureId: id,
            equipmentId: e.equipmentId,
            locationNote: e.locationNote,
            order: e.order,
          },
        });
      }
    }
  });
  revalidatePath("/sop-procedures");
  revalidatePath(`/sop-procedures/${id}/edit`);
}

export async function assignProcedureToSite(
  procedureId: string,
  siteId: string,
  fields: {
    welcomeText: string | null;
    waterLocation: string | null;
    accessNote: string | null;
    emergencyNote: string | null;
  }
) {
  await prisma.siteProcedure.upsert({
    where: { siteId_procedureId: { siteId, procedureId } },
    update: { ...fields, isActive: true },
    create: { siteId, procedureId, ...fields },
  });
  revalidatePath(`/sop-procedures/${procedureId}/edit`);
}

export async function removeSiteAssignment(siteProcedureId: string, procedureId: string) {
  await prisma.siteProcedure.delete({ where: { id: siteProcedureId } });
  revalidatePath(`/sop-procedures/${procedureId}/edit`);
}

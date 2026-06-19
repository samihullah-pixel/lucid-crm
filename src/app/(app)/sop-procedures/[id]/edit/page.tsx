import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProcedureBuilder } from "@/components/sop/procedure-builder";

export const dynamic = "force-dynamic";

export default async function EditProcedurePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const [procedure, allEquipment, sites] = await Promise.all([
    prisma.procedure.findUnique({
      where: { id },
      include: {
        steps: { orderBy: { order: "asc" } },
        equipment: { orderBy: { order: "asc" }, include: { equipment: true } },
        sites: { include: { site: true } },
      },
    }),
    prisma.equipmentItem.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.site.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (!procedure) notFound();

  return (
    <ProcedureBuilder
      procedure={{
        id: procedure.id,
        name: procedure.name,
        description: procedure.description,
      }}
      initialSteps={procedure.steps.map((s) => ({
        id: s.id,
        section: s.section ?? "",
        title: s.title,
        body: s.body ?? "",
        tip: s.tip ?? "",
        warning: s.warning ?? "",
        requiresCheck: s.requiresCheck,
      }))}
      initialEquipment={procedure.equipment.map((e) => ({
        id: e.id,
        equipmentId: e.equipmentId,
        name: e.equipment.name,
        locationNote: e.locationNote ?? e.equipment.defaultLocation ?? "",
      }))}
      equipmentLibrary={allEquipment.map((e) => ({
        id: e.id,
        name: e.name,
        defaultLocation: e.defaultLocation,
      }))}
      sites={sites.map((s) => ({ id: s.id, name: s.name }))}
      assignments={procedure.sites.map((sp) => ({
        id: sp.id,
        siteId: sp.siteId,
        siteName: sp.site.name,
        qrToken: sp.qrToken,
        welcomeText: sp.welcomeText ?? "",
        waterLocation: sp.waterLocation ?? "",
        accessNote: sp.accessNote ?? "",
        emergencyNote: sp.emergencyNote ?? "",
      }))}
    />
  );
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProcedureBuilder } from "@/components/sop/procedure-builder";

export const dynamic = "force-dynamic";

// Prisma-Json → { en?: {...}, es?: {...} } für den Editor
function asTr(value: unknown): { en?: Record<string, string>; es?: Record<string, string> } {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as { en?: Record<string, string>; es?: Record<string, string> };
  }
  return {};
}

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
        translations: asTr(procedure.translations),
      }}
      initialSteps={procedure.steps.map((s) => ({
        id: s.id,
        section: s.section ?? "",
        title: s.title,
        body: s.body ?? "",
        tip: s.tip ?? "",
        warning: s.warning ?? "",
        requiresCheck: s.requiresCheck,
        mediaUrl: s.mediaUrl ?? "",
        mediaType: s.mediaType,
        translations: asTr(s.translations),
      }))}
      initialEquipment={procedure.equipment.map((e) => ({
        id: e.id,
        equipmentId: e.equipmentId,
        name: e.equipment.name,
        locationNote: e.locationNote ?? e.equipment.defaultLocation ?? "",
        translations: asTr(e.equipment.translations),
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

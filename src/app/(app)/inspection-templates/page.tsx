import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { InspectionTemplatesTable } from "@/components/inspection-templates-table";

export default async function InspectionTemplatesPage() {
  const templates = await prisma.inspectionTemplate.findMany({
    include: { property: true, areas: { include: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows = templates.map((t) => ({
    id: t.id,
    name: t.name,
    propertyName: t.property?.name ?? null,
    areaCount: t.areas.length,
    itemCount: t.areas.reduce((sum, a) => sum + a.items.length, 0),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Aufnahmebögen</h1>
          <p className="font-sans text-sm font-light text-grey">Reinigungspläne mit Bereichen und Intervallen.</p>
        </div>
        <Link
          href="/inspection-templates/new"
          className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
        >
          + Neu
        </Link>
      </div>

      {templates.length === 0 ? (
        <p className="font-sans text-sm text-grey">Noch keine Aufnahmebögen vorhanden.</p>
      ) : (
        <InspectionTemplatesTable templates={rows} />
      )}
    </div>
  );
}

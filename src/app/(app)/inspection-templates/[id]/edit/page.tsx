import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateInspectionTemplateMeta } from "@/actions/inspection-templates";
import { InspectionTemplateEditor } from "@/components/forms/inspection-template-editor";
import { DeleteTemplateButton } from "@/components/forms/delete-template-button";

export default async function EditInspectionTemplatePage({ params }: { params: { id: string } }) {
  const [template, properties] = await Promise.all([
    prisma.inspectionTemplate.findUnique({
      where: { id: params.id },
      include: {
        property: true,
        areas: {
          orderBy: { order: "asc" },
          include: { items: { orderBy: { order: "asc" } } },
        },
      },
    }),
    prisma.property.findMany({ where: { isActive: true }, include: { customer: true }, orderBy: { name: "asc" } }),
  ]);

  if (!template) notFound();

  const updateMeta = updateInspectionTemplateMeta.bind(null, template.id);

  const initialAreas = template.areas.map((a) => ({
    id: a.id,
    name: a.name,
    order: a.order,
    items: a.items.map((i) => ({ id: i.id, label: i.label, interval: i.interval, durationMinutes: i.durationMinutes, order: i.order })),
  }));

  const isNew = template.areas.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">{template.name}</h1>
          <p className="font-sans text-sm font-light text-grey">
            {template.property ? `Objekt: ${template.property.name}` : "Kein Objekt zugeordnet"}
          </p>
        </div>
        <div className="flex gap-4">
          <a
            href={`/api/inspection-pdf?templateId=${template.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-gold/40 px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-grey transition-colors hover:border-gold hover:text-gold"
          >
            PDF herunterladen
          </a>
          <Link href="/inspection-templates" className="font-sans text-[11px] uppercase tracking-wide text-grey hover:text-gold self-center">
            ← Zurück
          </Link>
        </div>
      </div>

      <form action={updateMeta} className="flex flex-wrap gap-4 border border-gold/20 bg-white p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Name</label>
          <input
            name="name"
            defaultValue={template.name}
            required
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Objekt</label>
          <select
            name="propertyId"
            defaultValue={template.propertyId ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          >
            <option value="">— kein Objekt —</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.customer.companyName})</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-4">
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
          >
            Speichern
          </button>
          <DeleteTemplateButton templateId={template.id} />
        </div>
      </form>

      <div>
        <h2 className="mb-3 font-serif text-xl font-light text-black">Bereiche &amp; Reinigungspunkte</h2>
        {isNew && (
          <p className="mb-3 rounded border border-gold/20 bg-gold/5 px-4 py-3 font-sans text-sm text-grey">
            Café-Vorlage vorgeladen — bitte anpassen und speichern.
          </p>
        )}
        <InspectionTemplateEditor
          templateId={template.id}
          initialAreas={initialAreas}
          isNew={isNew}
        />
      </div>
    </div>
  );
}

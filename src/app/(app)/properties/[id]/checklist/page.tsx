import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChecklistEditor } from "@/components/forms/checklist-editor";
import { checklistToText } from "@/lib/checklist";

export const dynamic = "force-dynamic";

export default async function PropertyChecklistPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      checklistTemplate: {
        include: { items: { where: { archived: false }, orderBy: { order: "asc" } } },
      },
    },
  });
  if (!property) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/properties/${id}/edit`} className="font-sans text-[11px] uppercase tracking-wide text-gold-dark hover:text-gold">
          Zurück zum Objekt
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-light text-black">Checkliste: {property.name}</h1>
        <p className="font-sans text-sm font-light text-grey">
          Diese Punkte haken Mitarbeiter während der Schicht auf dem Handy ab.
        </p>
      </div>
      <ChecklistEditor
        propertyId={id}
        initialText={checklistToText(property.checklistTemplate?.items ?? [])}
      />
    </div>
  );
}

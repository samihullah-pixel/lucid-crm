import { prisma } from "@/lib/prisma";
import { createInspectionTemplate } from "@/actions/inspection-templates";

export default async function NewInspectionTemplatePage() {
  const properties = await prisma.property.findMany({
    where: { isActive: true },
    include: { customer: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Neuer Aufnahmebogen</h1>
        <p className="font-sans text-sm font-light text-grey">Name und Objekt festlegen, dann Bereiche und Punkte hinzufügen.</p>
      </div>
      <form action={createInspectionTemplate} className="max-w-lg space-y-4 border border-gold/20 bg-white p-6">
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Name *</label>
          <input
            name="name"
            required
            placeholder="z.B. Café Müller – Reinigungsplan"
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Objekt (optional)</label>
          <select name="propertyId" className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none">
            <option value="">— kein Objekt zugeordnet —</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.customer.companyName})</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
        >
          Erstellen &amp; Bereiche bearbeiten
        </button>
      </form>
    </div>
  );
}

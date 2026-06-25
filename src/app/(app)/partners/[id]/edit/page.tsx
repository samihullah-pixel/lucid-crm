import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updatePartner } from "@/actions/partners";

export default async function EditPartnerPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const partner = await prisma.partner.findUnique({ where: { id: params.id } });
  if (!partner) notFound();

  const update = updatePartner.bind(null, partner.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">{partner.name}</h1>
        <p className="font-sans text-sm font-light text-grey">Partner-Stammdaten bearbeiten.</p>
      </div>

      <form action={update} className="border border-gold/20 bg-white p-6 space-y-4 max-w-lg">
        <div>
          <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Name *</label>
          <input name="name" defaultValue={partner.name} required className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
        </div>
        <div>
          <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Ansprechpartner</label>
          <input name="contactPerson" defaultValue={partner.contactPerson ?? ""} className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
        </div>
        <div>
          <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">E-Mail (für Anfragen) *</label>
          <input name="email" type="email" defaultValue={partner.email} required className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
        </div>
        <div>
          <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Telefon</label>
          <input name="phone" defaultValue={partner.phone ?? ""} className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
        </div>
        <div>
          <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Leistungen</label>
          <input name="serviceArea" defaultValue={partner.serviceArea ?? ""} className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
        </div>
        <div>
          <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Notizen</label>
          <textarea name="notes" defaultValue={partner.notes ?? ""} rows={3} className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
        </div>
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" name="isActive" defaultChecked={partner.isActive} />
          <span className="font-sans text-sm text-black">Aktiv</span>
        </label>
        <button type="submit" className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black">
          Speichern
        </button>
      </form>
    </div>
  );
}

import { createSupplier } from "@/actions/suppliers";

export default function NewSupplierPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Neuer Lieferant</h1>
        <p className="font-sans text-sm font-light text-grey">Lieferant und Kontaktdaten erfassen.</p>
      </div>
      <form action={createSupplier} className="border border-gold/20 bg-white p-6 space-y-4 max-w-lg">
        <div>
          <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Name *</label>
          <input name="name" required className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
        </div>
        <div>
          <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">E-Mail (Bestelladresse) *</label>
          <input name="email" type="email" required className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
        </div>
        <div>
          <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Telefon</label>
          <input name="phone" className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
        </div>
        <div>
          <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Unsere Kundennummer (beim Lieferanten)</label>
          <input name="customerNumber" placeholder="erscheint in jeder Bestell-Mail" className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
        </div>
        <div>
          <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Standard-CC (optional)</label>
          <input name="defaultCc" type="email" placeholder="z.B. buchhaltung@firma.de" className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
        </div>
        <div>
          <label className="block font-sans text-[11px] uppercase tracking-wide text-grey mb-1">Notizen</label>
          <textarea name="notes" rows={3} className="w-full border border-black/20 px-3 py-2 font-sans text-sm" />
        </div>
        <button type="submit" className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black">
          Speichern
        </button>
      </form>
    </div>
  );
}

import { createInvoice } from "@/actions/invoices";

type Customer = { id: string; companyName: string };
type Property = { id: string; name: string };

const statusOptions = ["ENTWURF", "ERSTELLT", "VERSENDET", "BEZAHLT", "STORNIERT"];

export function InvoiceForm({
  customers,
  properties,
}: {
  customers: Customer[];
  properties: Property[];
}) {
  return (
    <form action={createInvoice} className="border border-gold/20 bg-white p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Kunde</label>
          <select name="customerId" required className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none">
            <option value="">Bitte waehlen</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Objekt (optional)</label>
          <select name="propertyId" className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none">
            <option value="">-</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Rechnungsdatum</label>
          <input name="invoiceDate" type="date" required className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Status</label>
          <select name="status" className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none">
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Leistungszeitraum von</label>
          <input name="servicePeriodFrom" type="date" required className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Leistungszeitraum bis</label>
          <input name="servicePeriodTo" type="date" required className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Nettobetrag (EUR)</label>
          <input name="netAmount" type="number" step="0.01" required className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Steuersatz (%)</label>
          <input name="taxRate" type="number" step="0.01" defaultValue="19" className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Notizen</label>
          <textarea name="notes" rows={3} className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Steuerbetrag und Bruttobetrag werden automatisch berechnet. Die Rechnungsnummer wird automatisch vergeben.
      </p>
      <div className="mt-6">
        <button type="submit" className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 text-[11px] font-sans uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]">
          Rechnung speichern
        </button>
      </div>
    </form>
  );
}

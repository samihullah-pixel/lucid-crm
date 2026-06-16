import { createExtraWork } from "@/actions/extra-works";

type Customer = { id: string; companyName: string };
type Property = { id: string; name: string };

export function ExtraWorkForm({
  customers,
  properties,
}: {
  customers: Customer[];
  properties: Property[];
}) {
  return (
    <form action={createExtraWork} className="border border-gold/20 bg-white p-6">
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
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Objekt</label>
          <select name="propertyId" required className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none">
            <option value="">Bitte waehlen</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Datum</label>
          <input name="date" type="date" required className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Abrechnungsart</label>
          <select name="billingType" className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none">
            <option value="STUNDENSATZ">Stundensatz</option>
            <option value="PAUSCHAL">Pauschal</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Beschreibung</label>
          <input name="description" required placeholder="z.B. Bauendreinigung extra" className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Stunden</label>
          <input name="hours" type="number" step="0.25" className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Stundensatz (EUR)</label>
          <input name="hourlyRate" type="number" step="0.01" className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Pauschalpreis (EUR)</label>
          <input name="flatRatePrice" type="number" step="0.01" className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="customerApproved" id="customerApproved" />
          <label htmlFor="customerApproved" className="text-sm font-medium">Vom Kunden freigegeben</label>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="billable" id="billable" defaultChecked />
          <label htmlFor="billable" className="text-sm font-medium">Abrechenbar</label>
        </div>
      </div>
      <div className="mt-6">
        <button type="submit" className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 text-[11px] font-sans uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]">
          Zusatzarbeit speichern
        </button>
      </div>
    </form>
  );
}

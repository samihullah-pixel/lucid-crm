import { createCustomer, updateCustomer } from "@/actions/customers";

type CustomerInitialValues = {
  id: string;
  companyName: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  billingAddress: string | null;
  postalCode: string | null;
  city: string | null;
  paymentTermsDays: number | null;
  notes: string | null;
};

export function CustomerForm({ initialValues }: { initialValues?: CustomerInitialValues }) {
  const action = initialValues
    ? updateCustomer.bind(null, initialValues.id)
    : createCustomer;

  return (
    <form action={action} className="border border-gold/20 bg-white p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Firmenname</label>
          <input
            name="companyName"
            required
            defaultValue={initialValues?.companyName}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">
            Ansprechpartner
          </label>
          <input
            name="contactPerson"
            defaultValue={initialValues?.contactPerson ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">E-Mail</label>
          <input
            name="email"
            type="email"
            defaultValue={initialValues?.email ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Telefon</label>
          <input
            name="phone"
            defaultValue={initialValues?.phone ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">
            Rechnungsadresse
          </label>
          <input
            name="billingAddress"
            defaultValue={initialValues?.billingAddress ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">PLZ</label>
          <input
            name="postalCode"
            defaultValue={initialValues?.postalCode ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Ort</label>
          <input
            name="city"
            defaultValue={initialValues?.city ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">
            Zahlungsziel in Tagen
          </label>
          <input
            name="paymentTermsDays"
            defaultValue={initialValues?.paymentTermsDays ?? 14}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Notizen</label>
          <textarea
            name="notes"
            rows={4}
            defaultValue={initialValues?.notes ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
      </div>
      <div className="mt-6">
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 text-[11px] font-sans uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
        >
          Kunde speichern
        </button>
      </div>
    </form>
  );
}

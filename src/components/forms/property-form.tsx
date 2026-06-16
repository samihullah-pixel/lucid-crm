import { createProperty, updateProperty } from "@/actions/properties";

type Customer = { id: string; companyName: string };

type PropertyInitialValues = {
  id: string;
  customerId: string;
  name: string;
  address: string;
  postalCode: string | null;
  city: string | null;
  contactOnSite: string | null;
  phoneOnSite: string | null;
  accessType: string | null;
  accessDetails: string | null;
  keyNumber: string | null;
  hasAlarmSystem: boolean;
  alarmNote: string | null;
  parkingInfo: string | null;
  hasElevator: boolean;
  floor: string | null;
  notes: string | null;
};

export function PropertyForm({
  customers,
  initialValues,
}: {
  customers: Customer[];
  initialValues?: PropertyInitialValues;
}) {
  const action = initialValues
    ? updateProperty.bind(null, initialValues.id)
    : createProperty;

  return (
    <form action={action} className="border border-gold/20 bg-white p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Kunde</label>
          <select
            name="customerId"
            required
            defaultValue={initialValues?.customerId}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          >
            <option value="">Bitte waehlen</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Objektname</label>
          <input name="name" required defaultValue={initialValues?.name} className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Adresse</label>
          <input name="address" required defaultValue={initialValues?.address} className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">PLZ</label>
          <input name="postalCode" defaultValue={initialValues?.postalCode ?? ""} className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Ort</label>
          <input name="city" defaultValue={initialValues?.city ?? ""} className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Ansprechpartner vor Ort</label>
          <input name="contactOnSite" defaultValue={initialValues?.contactOnSite ?? ""} className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Telefon vor Ort</label>
          <input name="phoneOnSite" defaultValue={initialValues?.phoneOnSite ?? ""} className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Zugangsart</label>
          <input name="accessType" placeholder="z.B. Schluessel, Code" defaultValue={initialValues?.accessType ?? ""} className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Schluesselnummer</label>
          <input name="keyNumber" defaultValue={initialValues?.keyNumber ?? ""} className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Zugangsdetails</label>
          <input name="accessDetails" defaultValue={initialValues?.accessDetails ?? ""} className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="hasAlarmSystem" id="hasAlarmSystem" defaultChecked={initialValues?.hasAlarmSystem} />
          <label htmlFor="hasAlarmSystem" className="font-sans text-[11px] uppercase tracking-wide text-grey">Alarmanlage vorhanden</label>
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Hinweis zur Alarmanlage</label>
          <input name="alarmNote" defaultValue={initialValues?.alarmNote ?? ""} className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="hasElevator" id="hasElevator" defaultChecked={initialValues?.hasElevator} />
          <label htmlFor="hasElevator" className="font-sans text-[11px] uppercase tracking-wide text-grey">Aufzug vorhanden</label>
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Etage</label>
          <input name="floor" defaultValue={initialValues?.floor ?? ""} className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Parkmoeglichkeit</label>
          <input name="parkingInfo" defaultValue={initialValues?.parkingInfo ?? ""} className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Notizen</label>
          <textarea name="notes" rows={3} defaultValue={initialValues?.notes ?? ""} className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
      </div>
      <div className="mt-6">
        <button type="submit" className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 text-[11px] font-sans uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]">
          Objekt speichern
        </button>
      </div>
    </form>
  );
}

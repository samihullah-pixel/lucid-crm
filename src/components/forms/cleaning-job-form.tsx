import { createCleaningJob, updateCleaningJob } from "@/actions/cleaning-jobs";

type Customer = { id: string; companyName: string };
type Property = { id: string; name: string; customerId: string };
type Employee = { id: string; firstName: string; lastName: string };

type CleaningJobInitialValues = {
  id: string;
  customerId: string;
  propertyId: string;
  employeeId: string | null;
  date: Date;
  startTime: string | null;
  endTime: string | null;
  workedHours: unknown;
  serviceType: string;
  note: string | null;
  status: string;
  billable: boolean;
};

const serviceTypes = [
  "UNTERHALTSREINIGUNG",
  "FENSTERREINIGUNG",
  "TREPPENHAUSREINIGUNG",
  "GRUNDREINIGUNG",
  "SONDERREINIGUNG",
  "BAUENDREINIGUNG",
  "DESINFEKTION",
  "SONSTIGES",
];

const statusOptions = ["GEPLANT", "ERLEDIGT", "VERSCHOBEN", "STORNIERT"];

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function CleaningJobForm({
  customers,
  properties,
  employees,
  initialValues,
  defaultDate,
}: {
  customers: Customer[];
  properties: Property[];
  employees: Employee[];
  initialValues?: CleaningJobInitialValues;
  defaultDate?: Date;
}) {
  const action = initialValues
    ? updateCleaningJob.bind(null, initialValues.id)
    : createCleaningJob;

  return (
    <form action={action} className="border border-gold/20 bg-white p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
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
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Objekt</label>
          <select
            name="propertyId"
            required
            defaultValue={initialValues?.propertyId}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          >
            <option value="">Bitte waehlen</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Mitarbeiter</label>
          <select
            name="employeeId"
            defaultValue={initialValues?.employeeId ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          >
            <option value="">Nicht zugewiesen</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Datum</label>
          <input
            name="date"
            type="date"
            required
            defaultValue={toDateInputValue(initialValues?.date ?? defaultDate)}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Art</label>
          <select
            name="serviceType"
            defaultValue={initialValues?.serviceType}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          >
            {serviceTypes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Startzeit</label>
          <input
            name="startTime"
            placeholder="09:00"
            defaultValue={initialValues?.startTime ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Endzeit</label>
          <input
            name="endTime"
            placeholder="11:00"
            defaultValue={initialValues?.endTime ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Tatsaechliche Stunden</label>
          <input
            name="workedHours"
            type="number"
            step="0.25"
            defaultValue={initialValues?.workedHours as any}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Status</label>
          <select
            name="status"
            defaultValue={initialValues?.status}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="billable"
            id="billable"
            defaultChecked={initialValues?.billable ?? true}
          />
          <label htmlFor="billable" className="font-sans text-[11px] uppercase tracking-wide text-grey">
            Abrechenbar
          </label>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Notiz</label>
          <textarea
            name="note"
            rows={3}
            defaultValue={initialValues?.note ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
      </div>
      <div className="mt-6">
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 text-[11px] font-sans uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
        >
          Einsatz speichern
        </button>
      </div>
    </form>
  );
}

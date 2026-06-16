import { createEmployee, updateEmployee } from "@/actions/employees";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  color: string | null;
  isActive: boolean;
};

export function EmployeeForm({ initialValues }: { initialValues?: Employee }) {
  const action = initialValues
    ? updateEmployee.bind(null, initialValues.id)
    : createEmployee;

  return (
    <form action={action} className="border border-gold/20 bg-white p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">
            Vorname
          </label>
          <input
            name="firstName"
            required
            defaultValue={initialValues?.firstName}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">
            Nachname
          </label>
          <input
            name="lastName"
            required
            defaultValue={initialValues?.lastName}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">
            E-Mail
          </label>
          <input
            name="email"
            type="email"
            defaultValue={initialValues?.email ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">
            Telefon
          </label>
          <input
            name="phone"
            defaultValue={initialValues?.phone ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">
            Farbe (Kalender)
          </label>
          <input
            name="color"
            type="color"
            defaultValue={initialValues?.color ?? "#c9a96e"}
            className="h-10 w-20 rounded border border-black/15"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            defaultChecked={initialValues?.isActive ?? true}
          />
          <label htmlFor="isActive" className="font-sans text-[11px] uppercase tracking-wide text-grey">
            Aktiv
          </label>
        </div>
      </div>
      <div className="mt-6">
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 text-[11px] font-sans uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
        >
          Mitarbeiter speichern
        </button>
      </div>
    </form>
  );
}

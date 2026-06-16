import Link from "next/link";
import { prisma } from "@/lib/prisma";

const months = [
  "Januar", "Februar", "Maerz", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const defaultMonth = now.getMonth() + 1;
  const defaultYear = now.getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Mitarbeiter</h1>
          <p className="font-sans text-sm font-light text-grey">
            Verwalte Mitarbeiter und erstelle PDF-Arbeitsplaene.
          </p>
        </div>
        <Link
          href="/employees/new"
          className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 text-[11px] font-sans uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
        >
          Neuer Mitarbeiter
        </Link>
      </div>
      <div className="border border-gold/20 bg-white p-6">
        {employees.length === 0 ? (
          <p className="font-sans text-sm font-light text-grey">Noch keine Mitarbeiter vorhanden.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-grey text-[11px] uppercase tracking-wide">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">E-Mail</th>
                <th className="py-2 pr-4">Telefon</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Arbeitsplan (PDF)</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} className="border-b border-black/10 last:border-0">
                  <td className="py-2 pr-4">{e.firstName} {e.lastName}</td>
                  <td className="py-2 pr-4">{e.email ?? "-"}</td>
                  <td className="py-2 pr-4">{e.phone ?? "-"}</td>
                  <td className="py-2 pr-4">{e.isActive ? "Aktiv" : "Inaktiv"}</td>
                  <td className="py-2 pr-4">
                    <form
                      action="/api/work-schedule"
                      method="get"
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="employeeId" value={e.id} />
                      <select
                        name="month"
                        defaultValue={defaultMonth}
                        className="rounded border border-black/15 px-2 py-1 font-sans text-xs"
                      >
                        {months.map((m, idx) => (
                          <option key={m} value={idx + 1}>{m}</option>
                        ))}
                      </select>
                      <input
                        name="year"
                        type="number"
                        defaultValue={defaultYear}
                        className="w-20 rounded border border-black/15 px-2 py-1 font-sans text-xs"
                      />
                      <button
                        type="submit"
                        className="rounded-full border border-gold px-3 py-1 font-sans text-[10px] uppercase tracking-wide text-gold-dark hover:bg-gold/10"
                      >
                        PDF
                      </button>
                    </form>
                  </td>
                  <td className="py-2 pr-4">
                    <Link href={`/employees/${e.id}/edit`} className="font-sans text-xs uppercase tracking-wide text-gold-dark hover:text-gold">
                      Bearbeiten
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}

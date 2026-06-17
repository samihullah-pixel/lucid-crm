import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteEmployee } from "@/actions/employees";
import { DeleteButton } from "@/components/ui/delete-button";

const months = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({ orderBy: { lastName: "asc" } });
  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Mitarbeiter</h1>
          <p className="font-sans text-sm font-light text-grey">Verwalte Mitarbeiter und erstelle PDF-Arbeitspläne.</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/api/export?type=employees"
            className="rounded border border-gold/30 px-4 py-2 font-sans text-[11px] uppercase tracking-[2px] text-grey hover:border-gold hover:text-gold"
          >
            CSV Export
          </a>
          <Link
            href="/employees/new"
            className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
          >
            + Neuer Mitarbeiter
          </Link>
        </div>
      </div>
      <div className="border border-gold/20 bg-white p-6">
        {employees.length === 0 ? (
          <p className="font-sans text-sm font-light text-grey">Noch keine Mitarbeiter vorhanden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-[11px] uppercase tracking-wide text-grey">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">E-Mail</th>
                  <th className="py-2 pr-4">Telefon</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Arbeitsplan (PDF)</th>
                  <th className="py-2 pr-4" />
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => {
                  const del = deleteEmployee.bind(null, e.id);
                  return (
                    <tr key={e.id} className="border-b border-black/10 last:border-0 hover:bg-light/40">
                      <td className="py-2 pr-4 font-sans">{e.firstName} {e.lastName}</td>
                      <td className="py-2 pr-4">{e.email ?? "—"}</td>
                      <td className="py-2 pr-4">{e.phone ?? "—"}</td>
                      <td className="py-2 pr-4">{e.isActive ? "Aktiv" : "Inaktiv"}</td>
                      <td className="py-2 pr-4">
                        <form action="/api/work-schedule" method="get" className="flex items-center gap-2">
                          <input type="hidden" name="employeeId" value={e.id} />
                          <select name="month" defaultValue={now.getMonth() + 1} className="rounded border border-black/15 px-2 py-1 font-sans text-xs">
                            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                          </select>
                          <input name="year" type="number" defaultValue={now.getFullYear()} className="w-20 rounded border border-black/15 px-2 py-1 font-sans text-xs" />
                          <button type="submit" className="rounded-full border border-gold px-3 py-1 font-sans text-[10px] uppercase tracking-wide text-gold-dark hover:bg-gold/10">PDF</button>
                        </form>
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-4">
                          <Link href={`/employees/${e.id}/edit`} className="font-sans text-[11px] uppercase tracking-wide text-gold-dark hover:text-gold">Bearbeiten</Link>
                          <DeleteButton action={del} confirm={`Mitarbeiter "${e.firstName} ${e.lastName}" wirklich löschen?`} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

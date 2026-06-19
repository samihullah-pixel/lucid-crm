import { prisma } from "@/lib/prisma";

const MONTH_NAMES = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];

export default async function HoursPage(
  props: {
    searchParams: Promise<{ year?: string; month?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const now = new Date();
  const year = Number(searchParams.year ?? now.getFullYear());
  const month = Number(searchParams.month ?? now.getMonth() + 1);

  const rangeStart = new Date(year, month - 1, 1);
  const rangeEnd = new Date(year, month, 1);

  const [employees, jobs] = await Promise.all([
    prisma.employee.findMany({ where: { isActive: true }, orderBy: { lastName: "asc" } }),
    prisma.cleaningJob.findMany({
      where: { date: { gte: rangeStart, lt: rangeEnd }, status: { not: "STORNIERT" } },
      include: { employee: true, property: true },
      orderBy: { date: "asc" },
    }),
  ]);

  // group by employee
  type Row = { name: string; jobs: number; hours: number; properties: Set<string> };
  const byEmployee = new Map<string, Row>();

  for (const j of jobs) {
    const key = j.employeeId ?? "__unassigned__";
    const name = j.employee ? `${j.employee.firstName} ${j.employee.lastName}` : "— nicht zugewiesen —";
    if (!byEmployee.has(key)) byEmployee.set(key, { name, jobs: 0, hours: 0, properties: new Set() });
    const row = byEmployee.get(key)!;
    row.jobs++;
    row.hours += Number(j.workedHours ?? 0);
    row.properties.add(j.property.name);
  }

  const rows = Array.from(byEmployee.values()).sort((a, b) => b.hours - a.hours);
  const totalHours = rows.reduce((s, r) => s + r.hours, 0);
  const totalJobs = rows.reduce((s, r) => s + r.jobs, 0);

  // build month/year nav
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Stundenauswertung</h1>
          <p className="font-sans text-sm font-light text-grey">Geleistete Stunden pro Mitarbeiter im Monat.</p>
        </div>
        <div className="flex items-center gap-4">
          <a href={`?year=${prevYear}&month=${prevMonth}`} className="font-sans text-[11px] uppercase tracking-wide text-grey hover:text-gold">← Zurück</a>
          <span className="font-serif text-lg font-light">{MONTH_NAMES[month - 1]} {year}</span>
          <a href={`?year=${nextYear}&month=${nextMonth}`} className="font-sans text-[11px] uppercase tracking-wide text-grey hover:text-gold">Weiter →</a>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-gold/20 bg-white p-6">
          <p className="font-sans text-sm text-grey">Keine Einsätze in diesem Monat.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-gold/20 bg-white p-4">
              <p className="font-sans text-sm font-light text-grey">Gesamtstunden</p>
              <p className="mt-2 font-serif text-2xl font-light">{totalHours.toFixed(1)} h</p>
            </div>
            <div className="rounded-lg border border-gold/20 bg-white p-4">
              <p className="font-sans text-sm font-light text-grey">Einsätze gesamt</p>
              <p className="mt-2 font-serif text-2xl font-light">{totalJobs}</p>
            </div>
            <div className="rounded-lg border border-gold/20 bg-white p-4">
              <p className="font-sans text-sm font-light text-grey">Mitarbeiter aktiv</p>
              <p className="mt-2 font-serif text-2xl font-light">{rows.filter(r => r.hours > 0).length}</p>
            </div>
            <div className="rounded-lg border border-gold/20 bg-white p-4">
              <p className="font-sans text-sm font-light text-grey">Ø Stunden/Einsatz</p>
              <p className="mt-2 font-serif text-2xl font-light">{totalJobs > 0 ? (totalHours / totalJobs).toFixed(1) : "—"} h</p>
            </div>
          </div>

          <div className="overflow-x-auto border border-gold/20 bg-white">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="border-b border-gold/20 text-[10px] uppercase tracking-wide text-grey">
                  <th className="px-4 py-3">Mitarbeiter</th>
                  <th className="px-4 py-3 text-right">Einsätze</th>
                  <th className="px-4 py-3 text-right">Stunden</th>
                  <th className="px-4 py-3 text-right">Ø / Einsatz</th>
                  <th className="px-4 py-3">Objekte</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-gold/10 last:border-0 hover:bg-light/40">
                    <td className="px-4 py-3 font-sans font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-right text-grey">{r.jobs}</td>
                    <td className="px-4 py-3 text-right font-medium">{r.hours.toFixed(1)} h</td>
                    <td className="px-4 py-3 text-right text-grey">{(r.hours / r.jobs).toFixed(1)} h</td>
                    <td className="px-4 py-3 text-xs text-grey">{Array.from(r.properties).join(", ")}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gold/30 bg-light/30">
                  <td className="px-4 py-3 font-sans text-xs uppercase tracking-wide text-grey">Gesamt</td>
                  <td className="px-4 py-3 text-right font-medium">{totalJobs}</td>
                  <td className="px-4 py-3 text-right font-medium">{totalHours.toFixed(1)} h</td>
                  <td className="px-4 py-3 text-right text-grey">{totalJobs > 0 ? (totalHours / totalJobs).toFixed(1) : "—"} h</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

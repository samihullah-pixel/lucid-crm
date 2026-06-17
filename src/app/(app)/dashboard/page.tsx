import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getWeekRange, getMonthRange, addDays, toDateParam } from "@/lib/date-range";

const weekdayShort = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function buildGridDays(view: "week" | "month", refDate: Date): Date[] {
  if (view === "week") {
    const { start } = getWeekRange(refDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }
  const { start, end } = getMonthRange(refDate);
  const gridStart = getWeekRange(start).start;
  const gridEnd = getWeekRange(addDays(end, -1)).end;
  const days: Date[] = [];
  let cursor = gridStart;
  while (cursor < gridEnd) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { view?: string; date?: string };
}) {
  const view: "week" | "month" = searchParams.view === "month" ? "month" : "week";
  const refDate = searchParams.date ? new Date(searchParams.date) : new Date();
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = addDays(startOfDay, 1);

  const [activeCustomers, jobsToday, openExtraWorks, openInvoices] = await Promise.all([
    prisma.customer.count({ where: { isActive: true } }),
    prisma.cleaningJob.count({ where: { date: { gte: startOfDay, lt: endOfDay } } }),
    prisma.extraWork.count({ where: { alreadyInvoiced: false, billable: true } }),
    prisma.invoice.count({ where: { status: { in: ["ENTWURF", "ERSTELLT", "VERSENDET"] } } }),
  ]);

  const gridDays = buildGridDays(view, refDate);
  const rangeStart = gridDays[0];
  const rangeEnd = addDays(gridDays[gridDays.length - 1], 1);

  const jobs = await prisma.cleaningJob.findMany({
    where: { date: { gte: rangeStart, lt: rangeEnd } },
    include: { customer: true, property: true, employee: true },
    orderBy: { date: "asc" },
  });

  const jobsByDay = new Map<string, typeof jobs>();
  for (const job of jobs) {
    const key = job.date.toDateString();
    jobsByDay.set(key, [...(jobsByDay.get(key) ?? []), job]);
  }

  const currentMonth = refDate.getMonth();
  const prevDate = addDays(view === "week" ? gridDays[0] : gridDays[0], view === "week" ? -7 : -28);
  const nextDate = addDays(view === "week" ? gridDays[6] : gridDays[gridDays.length - 1], 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Dashboard</h1>
        <p className="font-sans text-sm font-light text-grey">
          Uebersicht ueber Kunden, Einsaetze und Rechnungen.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="border border-gold/20 bg-white p-4">
          <p className="font-sans text-sm font-light text-grey">Aktive Kunden</p>
          <p className="mt-2 font-serif text-2xl font-light text-black">{activeCustomers}</p>
        </div>
        <div className="border border-gold/20 bg-white p-4">
          <p className="font-sans text-sm font-light text-grey">Einsaetze heute</p>
          <p className="mt-2 font-serif text-2xl font-light text-black">{jobsToday}</p>
        </div>
        <div className="border border-gold/20 bg-white p-4">
          <p className="font-sans text-sm font-light text-grey">Offene Zusatzarbeiten</p>
          <p className="mt-2 font-serif text-2xl font-light text-black">{openExtraWorks}</p>
        </div>
        <div className="border border-gold/20 bg-white p-4">
          <p className="font-sans text-sm font-light text-grey">Offene Rechnungen</p>
          <p className="mt-2 font-serif text-2xl font-light text-black">{openInvoices}</p>
        </div>
      </div>

      <div className="border border-gold/20 bg-white p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-serif text-xl font-light text-black">Kalender</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              <Link
                href={`?view=week&date=${toDateParam(refDate)}`}
                className={`font-sans text-[11px] uppercase tracking-wide ${view === "week" ? "text-gold-dark" : "text-grey hover:text-gold"}`}
              >
                Woche
              </Link>
              <span className="text-grey">/</span>
              <Link
                href={`?view=month&date=${toDateParam(refDate)}`}
                className={`font-sans text-[11px] uppercase tracking-wide ${view === "month" ? "text-gold-dark" : "text-grey hover:text-gold"}`}
              >
                Monat
              </Link>
            </div>
            <div className="flex gap-3">
              <Link
                href={`?view=${view}&date=${toDateParam(prevDate)}`}
                className="font-sans text-[11px] uppercase tracking-wide text-grey hover:text-gold"
              >
                &larr; Zurueck
              </Link>
              <Link
                href={`?view=${view}&date=${toDateParam(nextDate)}`}
                className="font-sans text-[11px] uppercase tracking-wide text-grey hover:text-gold"
              >
                Weiter &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
        <div className="grid min-w-[640px] grid-cols-7 gap-px bg-black/10">
          {weekdayShort.map((w) => (
            <div key={w} className="bg-light p-2 text-center font-sans text-[10px] uppercase tracking-wide text-grey">
              {w}
            </div>
          ))}
          {gridDays.map((day) => {
            const dayJobs = jobsByDay.get(day.toDateString()) ?? [];
            const isToday = day.toDateString() === today.toDateString();
            const isOutsideMonth = view === "month" && day.getMonth() !== currentMonth;
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[90px] bg-white p-2 ${isOutsideMonth ? "opacity-40" : ""}`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <p className={`font-sans text-xs ${isToday ? "font-medium text-gold-dark" : "text-grey"}`}>
                    {day.getDate()}.{day.getMonth() + 1}.
                  </p>
                  {!isOutsideMonth && (
                    <Link
                      href={`/cleaning-jobs/new?date=${toDateParam(day)}`}
                      className="font-sans text-[11px] leading-none text-grey opacity-0 hover:text-gold group-hover:opacity-100 hover:opacity-100"
                      title="Einsatz anlegen"
                    >
                      +
                    </Link>
                  )}
                </div>
                <div className="space-y-1">
                  {dayJobs.slice(0, 3).map((job) => (
                    <Link
                      key={job.id}
                      href={`/cleaning-jobs/${job.id}/edit`}
                      className="block truncate rounded bg-gold/10 px-1 py-0.5 font-sans text-[10px] text-black transition-colors hover:bg-gold/30"
                      title={`${job.property.name} (${job.customer.companyName}) - oeffnen`}
                    >
                      {job.startTime ? `${job.startTime} ` : ""}
                      {job.property.name}
                      {job.employee ? ` · ${job.employee.firstName[0]}${job.employee.lastName[0]}` : ""}
                    </Link>
                  ))}
                  {dayJobs.length > 3 && (
                    <p className="font-sans text-[10px] text-grey">+{dayJobs.length - 3} weitere</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}

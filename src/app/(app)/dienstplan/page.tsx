import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RosterCell } from "@/components/roster/roster-cell";
import { copyWeek } from "@/actions/roster";

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function getMonday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateParam(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getKW(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function formatDateShort(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.`;
}

export default async function DienstplanPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const refDate = searchParams.date ? new Date(searchParams.date) : new Date();
  const monday = getMonday(refDate);
  const sunday = addDays(monday, 6);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const kw = getKW(monday);

  const prevMonday = addDays(monday, -7);
  const nextMonday = addDays(monday, 7);
  const today = new Date();
  const todayMonday = getMonday(today);

  const sites = await prisma.site.findMany({
    where: { isActive: true },
    include: {
      shifts: {
        where: {
          isActive: true,
          validFrom: { lte: addDays(sunday, 1) },
          OR: [{ validUntil: null }, { validUntil: { gte: monday } }],
        },
        orderBy: { sortOrder: "asc" },
        include: {
          assignments: {
            where: {
              date: { gte: monday, lt: addDays(sunday, 1) },
            },
            include: {
              employee: true,
            },
          },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const employees = await prisma.employee.findMany({
    where: { isActive: true },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  let totalSlots = 0;
  let filledSlots = 0;
  let warningSlots = 0;
  let emptySlots = 0;

  for (const site of sites) {
    for (const shift of site.shifts) {
      for (const day of weekDays) {
        const isoWeekday = day.getDay() === 0 ? 7 : day.getDay();
        if (!shift.weekdays.includes(isoWeekday)) continue;
        totalSlots++;
        const dayAssignments = shift.assignments.filter(
          (a) => a.date.toDateString() === day.toDateString()
        );
        if (dayAssignments.length >= shift.requiredStaff) {
          filledSlots++;
        } else if (dayAssignments.length > 0) {
          warningSlots++;
        } else {
          emptySlots++;
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Dienstplan</h1>
          <p className="font-sans text-sm font-light text-grey">
            KW {kw} — {formatDateShort(monday)} – {formatDateShort(sunday)}
            {monday.getFullYear()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/dienstplan?date=${toDateParam(prevMonday)}`}
            className="font-sans text-[11px] uppercase tracking-wide text-grey hover:text-gold"
          >
            ← Vorwoche
          </Link>
          {todayMonday.getTime() !== monday.getTime() && (
            <Link
              href="/dienstplan"
              className="font-sans text-[11px] uppercase tracking-wide text-gold-dark hover:text-gold"
            >
              Heute
            </Link>
          )}
          <Link
            href={`/dienstplan?date=${toDateParam(nextMonday)}`}
            className="font-sans text-[11px] uppercase tracking-wide text-grey hover:text-gold"
          >
            Naechste Woche →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="border border-gold/20 bg-white p-3">
          <p className="font-sans text-[10px] uppercase tracking-[2px] text-grey">
            Dienste gesamt
          </p>
          <p className="mt-1 font-serif text-2xl font-light text-black">{totalSlots}</p>
        </div>
        <div className="border border-emerald-200 bg-emerald-50 p-3">
          <p className="font-sans text-[10px] uppercase tracking-[2px] text-emerald-700">
            Voll besetzt
          </p>
          <p className="mt-1 font-serif text-2xl font-light text-emerald-700">{filledSlots}</p>
        </div>
        <div className="border border-amber-200 bg-amber-50 p-3">
          <p className="font-sans text-[10px] uppercase tracking-[2px] text-amber-700">
            Teilbesetzt
          </p>
          <p className="mt-1 font-serif text-2xl font-light text-amber-700">{warningSlots}</p>
        </div>
        <div className="border border-red-200 bg-red-50 p-3">
          <p className="font-sans text-[10px] uppercase tracking-[2px] text-red-600">
            Unbesetzt
          </p>
          <p className="mt-1 font-serif text-2xl font-light text-red-600">{emptySlots}</p>
        </div>
      </div>

      {sites.length === 0 ? (
        <div className="border border-gold/20 bg-white p-8 text-center">
          <p className="font-sans text-sm text-grey">
            Noch keine Standorte mit Schichten angelegt.
          </p>
          <Link
            href="/sites/new"
            className="mt-2 inline-block font-sans text-sm text-gold-dark hover:underline"
          >
            Standort anlegen
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {sites.map((site) => (
            <div key={site.id} className="border border-gold/20 bg-white">
              <div className="flex items-center gap-3 border-b border-gold/10 px-4 py-3">
                {site.color && (
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: site.color }}
                  />
                )}
                <h2 className="font-serif text-lg font-light text-black">{site.name}</h2>
                <span className="font-sans text-[10px] text-grey">{site.shortName}</span>
              </div>

              {site.shifts.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="font-sans text-xs text-grey">
                    Keine aktiven Schichten fuer diese Woche.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop: Tabelle */}
                  <div className="hidden overflow-x-auto md:block">
                    {site.shifts.map((shift) => (
                      <div key={shift.id}>
                        <div className="grid grid-cols-[180px_repeat(7,1fr)]">
                          <div className="flex flex-col justify-center border-b border-r border-gold/10 bg-light px-3 py-2">
                            <span className="font-sans text-xs font-medium text-black">
                              {shift.name}
                            </span>
                            <span className="font-sans text-[10px] text-grey">
                              {shift.startTime} – {shift.endTime}
                            </span>
                            <span className="font-sans text-[10px] text-grey">
                              Soll: {shift.requiredStaff}
                            </span>
                          </div>
                          {weekDays.map((day, dayIdx) => {
                            const isoWeekday = day.getDay() === 0 ? 7 : day.getDay();
                            const isScheduled = shift.weekdays.includes(isoWeekday);
                            const dayAssignments = shift.assignments.filter(
                              (a) => a.date.toDateString() === day.toDateString()
                            );
                            const isToday = day.toDateString() === today.toDateString();

                            return (
                              <div
                                key={dayIdx}
                                className={`border-b border-r border-gold/10 ${isToday ? "ring-2 ring-inset ring-gold/40" : ""}`}
                              >
                                <RosterCell
                                  shiftId={shift.id}
                                  date={toDateParam(day)}
                                  assignments={dayAssignments}
                                  requiredStaff={shift.requiredStaff}
                                  availableEmployees={employees}
                                  isScheduledDay={isScheduled}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="grid grid-cols-[180px_repeat(7,1fr)]">
                      <div className="bg-light px-3 py-1" />
                      {weekDays.map((day, dayIdx) => {
                        const isToday = day.toDateString() === today.toDateString();
                        return (
                          <div
                            key={dayIdx}
                            className={`px-1 py-1 text-center ${isToday ? "bg-gold/5" : ""}`}
                          >
                            <span
                              className={`font-sans text-[10px] uppercase tracking-wide ${isToday ? "font-medium text-gold-dark" : "text-grey"}`}
                            >
                              {WEEKDAY_LABELS[dayIdx]} {formatDateShort(day)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobil: Tages-Karten */}
                  <div className="space-y-2 p-3 md:hidden">
                    {weekDays.map((day, dayIdx) => {
                      const isoWeekday = day.getDay() === 0 ? 7 : day.getDay();
                      const isToday = day.toDateString() === today.toDateString();
                      const hasAnyShift = site.shifts.some((s) => s.weekdays.includes(isoWeekday));
                      if (!hasAnyShift) return null;

                      return (
                        <div
                          key={dayIdx}
                          className={`rounded-lg border p-3 ${isToday ? "border-gold bg-gold/5" : "border-gold/10 bg-light/30"}`}
                        >
                          <p className={`mb-2 font-sans text-xs font-medium uppercase tracking-wide ${isToday ? "text-gold-dark" : "text-grey"}`}>
                            {WEEKDAY_LABELS[dayIdx]} {formatDateShort(day)}
                            {isToday && " — Heute"}
                          </p>
                          {site.shifts.map((shift) => {
                            if (!shift.weekdays.includes(isoWeekday)) return null;
                            const dayAssignments = shift.assignments.filter(
                              (a) => a.date.toDateString() === day.toDateString()
                            );
                            const count = dayAssignments.length;
                            const isFull = count >= shift.requiredStaff;

                            return (
                              <div key={shift.id} className="mb-2 last:mb-0">
                                <div className="mb-1 flex items-center justify-between">
                                  <span className="font-sans text-sm font-medium text-black">
                                    {shift.name}
                                  </span>
                                  <span className={`font-sans text-xs font-medium ${isFull ? "text-emerald-600" : count > 0 ? "text-amber-600" : "text-red-600"}`}>
                                    {count}/{shift.requiredStaff}
                                  </span>
                                </div>
                                <RosterCell
                                  shiftId={shift.id}
                                  date={toDateParam(day)}
                                  assignments={dayAssignments}
                                  requiredStaff={shift.requiredStaff}
                                  availableEmployees={employees}
                                  isScheduledDay={true}
                                />
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border border-gold/20 bg-white px-4 py-3">
        <span className="font-sans text-[11px] uppercase tracking-[2px] text-grey">
          Woche kopieren
        </span>
        <form action={copyWeek} className="flex items-center gap-3">
          <input type="hidden" name="sourceStart" value={toDateParam(monday)} />
          <input type="hidden" name="targetStart" value={toDateParam(nextMonday)} />
          <button
            type="submit"
            className="border border-gold/30 bg-gold/5 px-4 py-1.5 font-sans text-[11px] uppercase tracking-wide text-grey transition-colors hover:bg-gold/10 hover:text-black"
          >
            → In KW {getKW(nextMonday)} uebernehmen
          </button>
        </form>
      </div>
    </div>
  );
}

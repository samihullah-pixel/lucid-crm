import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  FLAG_LABELS,
  berlinMonthStart,
  formatDateTime,
  formatDuration,
  minutesBetween,
} from "@/lib/time-entry";

export const dynamic = "force-dynamic";

const STATUS_LABEL = { OPEN: "Läuft", DONE: "Erledigt", REVIEW: "Prüfen" } as const;
const inputClass =
  "rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none";

export default async function TimeEntriesPage(props: {
  searchParams: Promise<{ property?: string; employee?: string; month?: string }>;
}) {
  const sp = await props.searchParams;
  const where: Prisma.TimeEntryWhereInput = {};
  if (sp.property) where.propertyId = sp.property;
  if (sp.employee) where.employeeId = sp.employee;
  const m = /^(\d{4})-(\d{2})$/.exec(sp.month ?? "");
  if (m) {
    where.startedAt = {
      gte: berlinMonthStart(Number(m[1]), Number(m[2])),
      lt: berlinMonthStart(Number(m[1]), Number(m[2]) + 1),
    };
  }

  const [rows, properties, employees] = await Promise.all([
    prisma.timeEntry.findMany({
      where,
      include: {
        employee: { select: { firstName: true, lastName: true } },
        property: { select: { name: true } },
        _count: { select: { photos: true } },
      },
      orderBy: { startedAt: "desc" },
      take: 300,
    }),
    prisma.property.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.employee.findMany({
      orderBy: { lastName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  const isFlagged = (e: (typeof rows)[number]) =>
    e.status === "REVIEW" || (e.status === "OPEN" && e.flags.length > 0);
  // "Prüfen"-Einträge stehen oben (Reihenfolge innerhalb der Gruppen bleibt: neueste zuerst).
  const entries = [...rows.filter(isFlagged), ...rows.filter((e) => !isFlagged(e))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Zeiterfassung</h1>
        <p className="font-sans text-sm font-light text-grey">
          Schichten, die Mitarbeiter per QR-Code gestartet und beendet haben.
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <select name="property" defaultValue={sp.property ?? ""} className={inputClass}>
          <option value="">Alle Objekte</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select name="employee" defaultValue={sp.employee ?? ""} className={inputClass}>
          <option value="">Alle Mitarbeiter</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
          ))}
        </select>
        <input type="month" name="month" defaultValue={sp.month ?? ""} className={inputClass} />
        <button type="submit" className="rounded-full border border-gold px-4 py-2 font-sans text-[11px] uppercase tracking-wide text-gold-dark hover:bg-gold/10">
          Filtern
        </button>
        <Link href="/zeiterfassung" className="py-2 font-sans text-[11px] uppercase tracking-wide text-grey hover:text-gold">
          Zurücksetzen
        </Link>
      </form>

      <div className="flex flex-wrap items-center gap-4 font-sans text-[11px] uppercase tracking-wide">
        <span className="text-grey">CSV für die Lohnabrechnung ({sp.month || "aktueller Monat"}):</span>
        <a href={`/api/time-export${sp.month ? `?month=${sp.month}` : ""}`} className="text-gold-dark hover:text-gold">
          Stunden pro Mitarbeiter
        </a>
        <a href={`/api/time-export?detail=1${sp.month ? `&month=${sp.month}` : ""}`} className="text-gold-dark hover:text-gold">
          Alle Schichten
        </a>
      </div>

      <div className="rounded-lg border border-gold/20 bg-white p-6">
        {entries.length === 0 ? (
          <p className="font-sans text-sm font-light text-grey">Keine Schichten gefunden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-[10px] uppercase tracking-[2px] text-grey">
                  <th className="py-2 pr-4">Nr.</th>
                  <th className="py-2 pr-4">Mitarbeiter</th>
                  <th className="py-2 pr-4">Objekt</th>
                  <th className="py-2 pr-4">Start</th>
                  <th className="py-2 pr-4">Ende</th>
                  <th className="py-2 pr-4">Dauer</th>
                  <th className="py-2 pr-4">Fotos</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => {
                  const flagged = isFlagged(e);
                  return (
                    <tr key={e.id} className={`border-b border-black/5 align-top last:border-0 ${flagged ? "bg-red-50" : ""}`}>
                      <td className="py-2 pr-4 font-sans">
                        <Link href={`/zeiterfassung/${e.id}`} className="text-gold-dark underline underline-offset-4">
                          {e.number}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">{e.employee.firstName} {e.employee.lastName}</td>
                      <td className="py-2 pr-4">{e.property.name}</td>
                      <td className="py-2 pr-4">{formatDateTime(e.startedAt)}</td>
                      <td className="py-2 pr-4">{e.endedAt ? formatDateTime(e.endedAt) : "—"}</td>
                      <td className="py-2 pr-4">
                        {e.endedAt ? formatDuration(minutesBetween(e.startedAt, e.endedAt)) : "—"}
                      </td>
                      <td className="py-2 pr-4">{e._count.photos}</td>
                      <td className="py-2 pr-4">
                        <span className={flagged ? "text-red-700" : ""}>
                          {flagged && e.status === "OPEN" ? "Läuft, prüfen" : STATUS_LABEL[e.status]}
                        </span>
                        {e.flags.length > 0 && (
                          <ul className="mt-1 space-y-0.5 text-xs font-light text-grey">
                            {e.flags.map((f) => (
                              <li key={f}>{FLAG_LABELS[f] ?? f}</li>
                            ))}
                          </ul>
                        )}
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

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { completeWorkLog, reopenWorkLog } from "@/actions/work-logs";
import { WorkLogItem } from "@/components/protocols/work-log-item";
import { WorkLogEmployeeSelector } from "@/components/protocols/work-log-employee-selector";
export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
}

const WEEKDAY_NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

export default async function WorkLogDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const workLog = await prisma.workLog.findUnique({
    where: { id: params.id },
    include: {
      template: true,
      site: true,
      entries: {
        orderBy: { sortOrder: "asc" },
        include: { employee: true },
      },
    },
  });

  if (!workLog) notFound();

  const employees = await prisma.employee.findMany({
    where: { isActive: true },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  const total = workLog.entries.length;
  const checked = workLog.entries.filter((e) => e.checked).length;
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
  const isComplete = workLog.status === "ABGESCHLOSSEN";
  const dayName = WEEKDAY_NAMES[workLog.date.getDay()];

  const areas = new Map<string, typeof workLog.entries>();
  for (const entry of workLog.entries) {
    const list = areas.get(entry.areaName) ?? [];
    list.push(entry);
    areas.set(entry.areaName, list);
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/arbeitsprotokoll"
          className="mb-2 inline-block font-sans text-[11px] uppercase tracking-wide text-grey hover:text-gold"
        >
          ← Arbeitsprotokolle
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-light text-black sm:text-3xl">
              {workLog.site?.name ?? workLog.template.name}
            </h1>
            <p className="font-sans text-sm font-light text-grey">
              {dayName}, {formatDate(workLog.date)}
            </p>
          </div>

          <span
            className={`inline-block self-start rounded border px-3 py-1 font-sans text-[11px] uppercase tracking-wide ${
              isComplete
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : checked > 0
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {isComplete ? "Erledigt" : checked > 0 ? "In Arbeit" : "Offen"}
          </span>
        </div>
      </div>

      {/* Fortschritt + Mitarbeiter-Auswahl */}
      <div className="rounded-lg border border-gold/20 bg-white p-4">
        <div className="flex items-center gap-4">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5">
            <div
              className={`h-full rounded-full transition-all ${
                pct === 100 ? "bg-emerald-500" : pct > 0 ? "bg-gold" : "bg-black/10"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-sans text-sm font-medium text-black">
            {checked}/{total}
          </span>
          <span className="font-sans text-xs text-grey">{pct}%</span>
        </div>

        {!isComplete && (
          <div className="mt-3">
            <WorkLogEmployeeSelector employees={employees} />
          </div>
        )}

        {workLog.completedAt && (
          <p className="mt-2 font-sans text-xs text-grey">
            Abgeschlossen am: {formatDate(workLog.completedAt)}
          </p>
        )}
        {workLog.notes && (
          <p className="mt-1 font-sans text-xs italic text-grey">{workLog.notes}</p>
        )}
      </div>

      {/* Bereiche mit Einträgen */}
      <div className="space-y-4">
        {Array.from(areas.entries()).map(([areaName, entries]) => {
          const areaChecked = entries.filter((e) => e.checked).length;
          const areaTotal = entries.length;
          const areaPct = areaTotal > 0 ? Math.round((areaChecked / areaTotal) * 100) : 0;
          return (
            <div key={areaName} className="overflow-hidden rounded-lg border border-gold/20 bg-white">
              <div className="border-b border-gold/10 bg-light/40 px-4 py-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-sans text-base font-medium text-black sm:text-sm">{areaName}</h2>
                  <span
                    className={`font-sans text-xs font-medium ${
                      areaChecked === areaTotal ? "text-emerald-600" : "text-grey"
                    }`}
                  >
                    {areaChecked}/{areaTotal}
                  </span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-black/5">
                  <div
                    className={`h-full rounded-full transition-all ${
                      areaPct === 100 ? "bg-emerald-500" : areaPct > 0 ? "bg-gold" : ""
                    }`}
                    style={{ width: `${areaPct}%` }}
                  />
                </div>
              </div>
              <div className="divide-y divide-black/5">
                {entries.map((entry) => (
                  <WorkLogItem
                    key={entry.id}
                    entry={entry}
                    disabled={isComplete}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Abschliessen */}
      {!isComplete && (
        <div className="border border-gold/20 bg-white p-4 sm:p-6">
          <h2 className="mb-4 font-serif text-lg font-light text-black">
            Arbeitsprotokoll abschliessen
          </h2>
          <form action={completeWorkLog} className="space-y-4">
            <input type="hidden" name="workLogId" value={workLog.id} />
            <div>
              <label className="mb-1 block font-sans text-[11px] uppercase tracking-[2px] text-grey">
                Anmerkungen (optional)
              </label>
              <textarea
                name="notes"
                rows={2}
                className="w-full border border-gold/20 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
                placeholder="Besondere Vorkommnisse, fehlende Materialien..."
              />
            </div>
            <button
              type="submit"
              className="border border-emerald-400 bg-emerald-50 px-6 py-2 font-sans text-[11px] uppercase tracking-[3px] text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              Erledigt
            </button>
          </form>
        </div>
      )}

      {isComplete && (
        <form action={reopenWorkLog}>
          <input type="hidden" name="workLogId" value={workLog.id} />
          <button
            type="submit"
            className="border border-gold/30 bg-gold/5 px-4 py-2 font-sans text-[11px] uppercase tracking-wide text-grey transition-colors hover:bg-gold/10 hover:text-black"
          >
            Wieder oeffnen
          </button>
        </form>
      )}
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createWorkLog, deleteWorkLog } from "@/actions/work-logs";
import { DeleteButton } from "@/components/ui/delete-button";

function formatDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
}

function toDateParam(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const WEEKDAY_NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  OFFEN: { label: "Offen", bg: "bg-red-50 border-red-200", text: "text-red-700" },
  ABGESCHLOSSEN: { label: "Erledigt", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
};

export default async function ArbeitsprotokollPage() {
  const workLogs = await prisma.workLog.findMany({
    include: {
      template: true,
      site: true,
      entries: true,
    },
    orderBy: { date: "desc" },
  });

  const templates = await prisma.inspectionTemplate.findMany({
    where: { siteId: { not: null } },
    include: { site: true },
    orderBy: { name: "asc" },
  });

  const today = new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Arbeitsprotokoll</h1>
        <p className="font-sans text-sm font-light text-grey">
          Tägliche Checkliste für die Reinigungskräfte.
        </p>
      </div>

      {templates.length > 0 && (
        <div className="border border-gold/20 bg-white p-4 sm:p-6">
          <h2 className="mb-4 font-serif text-lg font-light text-black">
            Neues Arbeitsprotokoll
          </h2>
          <form action={createWorkLog} className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="flex-1 sm:flex-initial">
              <label className="mb-1 block font-sans text-[11px] uppercase tracking-[2px] text-grey">
                Vorlage / Standort
              </label>
              <select
                name="templateId"
                required
                className="w-full border border-gold/20 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.site ? `(${t.site.shortName})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block font-sans text-[11px] uppercase tracking-[2px] text-grey">
                Datum
              </label>
              <input
                type="date"
                name="date"
                required
                defaultValue={toDateParam(today)}
                className="border border-gold/20 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="border border-gold bg-gold/10 px-6 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black transition-colors hover:bg-gold/20"
            >
              Erstellen
            </button>
          </form>
        </div>
      )}

      {workLogs.length === 0 && (
        <div className="border border-gold/20 bg-white p-8 text-center">
          <p className="font-sans text-sm text-grey">Noch keine Arbeitsprotokolle vorhanden.</p>
        </div>
      )}

      {workLogs.length > 0 && (
        <div className="space-y-3">
          {workLogs.map((log) => {
            const total = log.entries.length;
            const checked = log.entries.filter((e) => e.checked).length;
            const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
            const status = STATUS_LABELS[log.status] ?? STATUS_LABELS.OFFEN;
            const dayName = WEEKDAY_NAMES[log.date.getDay()];

            return (
              <Link
                key={log.id}
                href={`/arbeitsprotokoll/${log.id}`}
                className="block border border-gold/20 bg-white transition-colors hover:border-gold/40"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {log.site?.color && (
                        <span
                          className="mt-1 inline-block h-3 w-3 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: log.site.color }}
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-serif text-base font-light text-black sm:text-lg">
                          {log.site?.name ?? log.template.name}
                        </p>
                        <p className="font-sans text-xs text-grey">
                          {dayName}, {formatDate(log.date)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`flex-shrink-0 rounded border px-2 py-0.5 font-sans text-[10px] uppercase tracking-wide ${status.bg} ${status.text}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5">
                      <div
                        className={`h-full rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : "bg-gold"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="flex-shrink-0 font-sans text-xs text-grey">
                      {checked}/{total}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

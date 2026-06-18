import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createProtocol, deleteProtocol } from "@/actions/protocols";
import { DeleteButton } from "@/components/ui/delete-button";

function getMonday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function formatDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
}

function getKW(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function toDateParam(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  OFFEN: { label: "Offen", bg: "bg-red-50 border-red-200", text: "text-red-700" },
  IN_BEARBEITUNG: { label: "In Bearbeitung", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
  ABGESCHLOSSEN: { label: "Abgeschlossen", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
};

export default async function ProtokollePage() {
  const protocols = await prisma.inspectionProtocol.findMany({
    include: {
      template: true,
      site: true,
      employee: true,
      checks: true,
    },
    orderBy: { weekStart: "desc" },
  });

  const templates = await prisma.inspectionTemplate.findMany({
    where: { siteId: { not: null } },
    include: { site: true },
    orderBy: { name: "asc" },
  });

  const monday = getMonday(new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Kontrollprotokolle</h1>
          <p className="font-sans text-sm font-light text-grey">
            Woechentliche Rundgang-Checklisten nach Standort.
          </p>
        </div>
      </div>

      {templates.length > 0 && (
        <div className="border border-gold/20 bg-white p-6">
          <h2 className="mb-4 font-serif text-lg font-light text-black">
            Neues Protokoll erstellen
          </h2>
          <form action={createProtocol} className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block font-sans text-[11px] uppercase tracking-[2px] text-grey">
                Vorlage
              </label>
              <select
                name="templateId"
                required
                className="border border-gold/20 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
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
                Woche ab
              </label>
              <input
                type="date"
                name="weekStart"
                required
                defaultValue={toDateParam(monday)}
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

      {templates.length === 0 && (
        <div className="border border-gold/20 bg-white p-8 text-center">
          <p className="font-sans text-sm text-grey">
            Noch keine Vorlagen mit Standort-Verknuepfung vorhanden.
          </p>
          <p className="mt-1 font-sans text-xs text-grey">
            Erstelle einen Aufnahmebogen unter{" "}
            <Link href="/inspection-templates/new" className="text-gold-dark hover:underline">
              Aufnahmebögen
            </Link>{" "}
            und verknuepfe ihn mit einem Standort.
          </p>
        </div>
      )}

      {protocols.length > 0 && (
        <div className="space-y-3">
          {protocols.map((p) => {
            const total = p.checks.length;
            const checked = p.checks.filter((c) => c.checked).length;
            const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
            const status = STATUS_LABELS[p.status] ?? STATUS_LABELS.OFFEN;
            const sunday = new Date(p.weekStart);
            sunday.setDate(sunday.getDate() + 6);

            return (
              <div key={p.id} className="border border-gold/20 bg-white">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    {p.site?.color && (
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: p.site.color }}
                      />
                    )}
                    <div>
                      <Link
                        href={`/protokolle/${p.id}`}
                        className="font-serif text-lg font-light text-black hover:text-gold-dark"
                      >
                        {p.template.name}
                      </Link>
                      <p className="font-sans text-xs text-grey">
                        KW {getKW(p.weekStart)} — {formatDate(p.weekStart)} – {formatDate(sunday)}
                        {p.site && ` · ${p.site.name}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-black/5">
                          <div
                            className="h-full rounded-full bg-gold transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-sans text-xs text-grey">
                          {checked}/{total}
                        </span>
                      </div>
                      {p.employee && (
                        <p className="mt-0.5 font-sans text-[10px] text-grey">
                          {p.employee.firstName} {p.employee.lastName}
                        </p>
                      )}
                    </div>

                    <span
                      className={`rounded border px-2 py-0.5 font-sans text-[10px] uppercase tracking-wide ${status.bg} ${status.text}`}
                    >
                      {status.label}
                    </span>

                    <div className="flex gap-2">
                      <Link
                        href={`/protokolle/${p.id}`}
                        className="font-sans text-[11px] uppercase tracking-wide text-grey hover:text-gold"
                      >
                        Oeffnen
                      </Link>
                      {p.status !== "ABGESCHLOSSEN" && (
                        <DeleteButton
                          action={deleteProtocol.bind(null, p.id)}
                          confirm={`Protokoll KW ${getKW(p.weekStart)} wirklich loeschen?`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

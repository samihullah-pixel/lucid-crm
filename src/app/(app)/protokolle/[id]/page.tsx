import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { completeProtocol, reopenProtocol } from "@/actions/protocols";
import { CheckItem } from "@/components/protocols/check-item";

function formatDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
}

function getKW(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default async function ProtocolPage({ params }: { params: { id: string } }) {
  const protocol = await prisma.inspectionProtocol.findUnique({
    where: { id: params.id },
    include: {
      template: true,
      site: true,
      employee: true,
      checks: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!protocol) notFound();

  const employees = await prisma.employee.findMany({
    where: { isActive: true },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  const sunday = new Date(protocol.weekStart);
  sunday.setDate(sunday.getDate() + 6);

  const total = protocol.checks.length;
  const checked = protocol.checks.filter((c) => c.checked).length;
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
  const isComplete = protocol.status === "ABGESCHLOSSEN";

  const areas = new Map<string, typeof protocol.checks>();
  for (const check of protocol.checks) {
    const list = areas.get(check.areaName) ?? [];
    list.push(check);
    areas.set(check.areaName, list);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/protokolle"
            className="mb-2 inline-block font-sans text-[11px] uppercase tracking-wide text-grey hover:text-gold"
          >
            ← Protokolle
          </Link>
          <h1 className="font-serif text-3xl font-light text-black">
            {protocol.template.name}
          </h1>
          <p className="font-sans text-sm font-light text-grey">
            KW {getKW(protocol.weekStart)} — {formatDate(protocol.weekStart)} –{" "}
            {formatDate(sunday)}
            {protocol.site && ` · ${protocol.site.name}`}
          </p>
        </div>

        <div className="text-right">
          <span
            className={`inline-block rounded border px-3 py-1 font-sans text-[11px] uppercase tracking-wide ${
              isComplete
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : checked > 0
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {isComplete ? "Abgeschlossen" : checked > 0 ? "In Bearbeitung" : "Offen"}
          </span>
        </div>
      </div>

      <div className="border border-gold/20 bg-white p-4">
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
        {protocol.employee && (
          <p className="mt-2 font-sans text-xs text-grey">
            Kontrolleur: {protocol.employee.firstName} {protocol.employee.lastName}
          </p>
        )}
        {protocol.completedAt && (
          <p className="font-sans text-xs text-grey">
            Abgeschlossen am: {formatDate(protocol.completedAt)}
          </p>
        )}
        {protocol.notes && (
          <p className="mt-1 font-sans text-xs italic text-grey">{protocol.notes}</p>
        )}
      </div>

      <div className="space-y-4">
        {Array.from(areas.entries()).map(([areaName, checks]) => {
          const areaChecked = checks.filter((c) => c.checked).length;
          const areaTotal = checks.length;
          return (
            <div key={areaName} className="border border-gold/20 bg-white">
              <div className="flex items-center justify-between border-b border-gold/10 bg-light/40 px-4 py-3">
                <h2 className="font-sans text-sm font-medium text-black">{areaName}</h2>
                <span
                  className={`font-sans text-xs ${
                    areaChecked === areaTotal ? "text-emerald-600" : "text-grey"
                  }`}
                >
                  {areaChecked}/{areaTotal}
                </span>
              </div>
              <div className="divide-y divide-black/5 px-2 py-1">
                {checks.map((check) => (
                  <CheckItem key={check.id} check={check} disabled={isComplete} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {!isComplete && (
        <div className="border border-gold/20 bg-white p-6">
          <h2 className="mb-4 font-serif text-lg font-light text-black">
            Rundgang abschliessen
          </h2>
          <form action={completeProtocol} className="space-y-4">
            <input type="hidden" name="protocolId" value={protocol.id} />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block font-sans text-[11px] uppercase tracking-[2px] text-grey">
                  Kontrolleur
                </label>
                <select
                  name="employeeId"
                  className="w-full border border-gold/20 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
                >
                  <option value="">Bitte waehlen...</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block font-sans text-[11px] uppercase tracking-[2px] text-grey">
                  Anmerkungen
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  className="w-full border border-gold/20 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
                  placeholder="Allgemeine Bemerkungen zum Rundgang..."
                />
              </div>
            </div>

            <button
              type="submit"
              className="border border-emerald-400 bg-emerald-50 px-6 py-2 font-sans text-[11px] uppercase tracking-[3px] text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              Protokoll abschliessen
            </button>
          </form>
        </div>
      )}

      {isComplete && (
        <form action={reopenProtocol}>
          <input type="hidden" name="protocolId" value={protocol.id} />
          <button
            type="submit"
            className="border border-gold/30 bg-gold/5 px-4 py-2 font-sans text-[11px] uppercase tracking-wide text-grey transition-colors hover:bg-gold/10 hover:text-black"
          >
            Protokoll wieder oeffnen
          </button>
        </form>
      )}
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import {
  FLAG_LABELS,
  formatDateTime,
  formatDuration,
  minutesBetween,
} from "@/lib/time-entry";

export const dynamic = "force-dynamic";

const STATUS_LABEL = { OPEN: "Läuft", DONE: "Erledigt", REVIEW: "Prüfen" } as const;

export default async function TimeEntriesPage() {
  const include = {
    employee: { select: { firstName: true, lastName: true } },
    property: { select: { name: true, targetMinutes: true } },
  } as const;

  // "Prüfen"-Einträge (und laufende mit Auffälligkeit) stehen oben.
  const [flagged, rest] = await Promise.all([
    prisma.timeEntry.findMany({
      where: { OR: [{ status: "REVIEW" }, { status: "OPEN", NOT: { flags: { isEmpty: true } } }] },
      include,
      orderBy: { startedAt: "desc" },
    }),
    prisma.timeEntry.findMany({
      where: { status: { in: ["DONE", "OPEN"] }, flags: { isEmpty: true } },
      include,
      orderBy: { startedAt: "desc" },
      take: 100,
    }),
  ]);
  const entries = [...flagged, ...rest];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Zeiterfassung</h1>
        <p className="font-sans text-sm font-light text-grey">
          Schichten, die Mitarbeiter per QR-Code gestartet und beendet haben.
        </p>
      </div>
      <div className="rounded-lg border border-gold/20 bg-white p-6">
        {entries.length === 0 ? (
          <p className="font-sans text-sm font-light text-grey">Noch keine Schichten erfasst.</p>
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
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => {
                  const review = e.status === "REVIEW" || (e.status === "OPEN" && e.flags.length > 0);
                  return (
                    <tr
                      key={e.id}
                      className={`border-b border-black/5 align-top last:border-0 ${review ? "bg-red-50" : ""}`}
                    >
                      <td className="py-2 pr-4 font-sans">{e.number}</td>
                      <td className="py-2 pr-4">{e.employee.firstName} {e.employee.lastName}</td>
                      <td className="py-2 pr-4">{e.property.name}</td>
                      <td className="py-2 pr-4">{formatDateTime(e.startedAt)}</td>
                      <td className="py-2 pr-4">{e.endedAt ? formatDateTime(e.endedAt) : "—"}</td>
                      <td className="py-2 pr-4">
                        {e.endedAt ? formatDuration(minutesBetween(e.startedAt, e.endedAt)) : "—"}
                      </td>
                      <td className="py-2 pr-4">
                        <span className={review ? "font-normal text-red-700" : ""}>
                          {review && e.status === "OPEN" ? "Läuft, prüfen" : STATUS_LABEL[e.status]}
                        </span>
                        {e.flags.length > 0 && (
                          <ul className="mt-1 space-y-0.5 text-xs font-light text-grey">
                            {e.flags.map((f) => (
                              <li key={f}>{FLAG_LABELS[f] ?? f}</li>
                            ))}
                          </ul>
                        )}
                        {e.notes && <p className="mt-1 text-xs font-light">Notiz: {e.notes}</p>}
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

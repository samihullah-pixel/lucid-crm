import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteSite } from "@/actions/sites";
import { DeleteButton } from "@/components/ui/delete-button";

const weekdayNames = ["", "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export default async function SitesPage() {
  const sites = await prisma.site.findMany({
    include: { shifts: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Standorte</h1>
          <p className="font-sans text-sm font-light text-grey">
            Verwaltung der Einsatzorte und Schichten.
          </p>
        </div>
        <Link
          href="/sites/new"
          className="border border-gold bg-gold/10 px-4 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black transition-colors hover:bg-gold/20"
        >
          + Standort
        </Link>
      </div>

      {sites.length === 0 ? (
        <div className="border border-gold/20 bg-white p-8 text-center">
          <p className="font-sans text-sm text-grey">Noch keine Standorte angelegt.</p>
          <Link href="/sites/new" className="mt-2 inline-block font-sans text-sm text-gold-dark hover:underline">
            Ersten Standort anlegen
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sites.map((site) => (
            <div key={site.id} className="border border-gold/20 bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {site.color && (
                    <span
                      className="inline-block h-4 w-4 rounded-full"
                      style={{ backgroundColor: site.color }}
                    />
                  )}
                  <div>
                    <h2 className="font-serif text-xl font-light text-black">
                      {site.name}
                      <span className="ml-2 font-sans text-xs text-grey">({site.shortName})</span>
                    </h2>
                    {site.address && (
                      <p className="font-sans text-sm font-light text-grey">{site.address}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/sites/${site.id}/edit`}
                    className="font-sans text-[11px] uppercase tracking-wide text-grey hover:text-gold"
                  >
                    Bearbeiten
                  </Link>
                  <DeleteButton
                    action={deleteSite.bind(null, site.id)}
                    confirm={`Standort "${site.name}" wirklich loeschen? Alle Schichten und Zuweisungen werden ebenfalls geloescht.`}
                  />
                </div>
              </div>

              {site.shifts.length > 0 && (
                <div className="mt-4 border-t border-gold/10 pt-4">
                  <p className="mb-2 font-sans text-[11px] uppercase tracking-[2px] text-grey">
                    Schichten
                  </p>
                  <div className="space-y-2">
                    {site.shifts.map((shift) => (
                      <div
                        key={shift.id}
                        className="flex items-center justify-between rounded bg-light px-3 py-2"
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-sans text-sm font-medium text-black">
                            {shift.name}
                          </span>
                          <span className="font-sans text-xs text-grey">
                            {shift.startTime} – {shift.endTime}
                          </span>
                          <span className="font-sans text-xs text-grey">
                            Soll: {shift.requiredStaff}
                          </span>
                          <span className="font-sans text-[10px] text-grey">
                            {shift.weekdays.map((d) => weekdayNames[d]).join(", ")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!site.isActive && (
                <p className="mt-2 font-sans text-xs text-grey italic">Inaktiv</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

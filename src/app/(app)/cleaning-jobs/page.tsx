import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteCleaningJob } from "@/actions/cleaning-jobs";
import { DeleteButton } from "@/components/ui/delete-button";

export default async function CleaningJobsPage() {
  const jobs = await prisma.cleaningJob.findMany({
    orderBy: { date: "desc" },
    include: { customer: true, property: true, employee: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Einsätze</h1>
          <p className="font-sans text-sm font-light text-grey">Alle durchgeführten und geplanten Einsätze.</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/api/export?type=cleaning-jobs"
            className="rounded border border-gold/30 px-4 py-2 font-sans text-[11px] uppercase tracking-[2px] text-grey hover:border-gold hover:text-gold"
          >
            CSV Export
          </a>
          <Link
            href="/cleaning-jobs/new"
            className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
          >
            + Neuer Einsatz
          </Link>
        </div>
      </div>
      <div className="border border-gold/20 bg-white p-6">
        {jobs.length === 0 ? (
          <p className="font-sans text-sm font-light text-grey">Noch keine Einsätze vorhanden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-[11px] uppercase tracking-wide text-grey">
                  <th className="py-2 pr-4">Datum</th>
                  <th className="py-2 pr-4">Kunde</th>
                  <th className="py-2 pr-4">Objekt</th>
                  <th className="py-2 pr-4">Mitarbeiter</th>
                  <th className="py-2 pr-4">Art</th>
                  <th className="py-2 pr-4">Stunden</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4" />
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => {
                  const del = deleteCleaningJob.bind(null, j.id);
                  return (
                    <tr key={j.id} className="border-b border-black/10 last:border-0 hover:bg-light/40">
                      <td className="py-2 pr-4">{j.date.toLocaleDateString("de-DE")}</td>
                      <td className="py-2 pr-4">{j.customer.companyName}</td>
                      <td className="py-2 pr-4">{j.property.name}</td>
                      <td className="py-2 pr-4">{j.employee ? `${j.employee.firstName} ${j.employee.lastName}` : "—"}</td>
                      <td className="py-2 pr-4 text-grey text-xs">{j.serviceType}</td>
                      <td className="py-2 pr-4">{j.workedHours?.toString() ?? "—"}</td>
                      <td className="py-2 pr-4 text-xs">{j.status}</td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-4">
                          <Link href={`/cleaning-jobs/${j.id}/edit`} className="font-sans text-[11px] uppercase tracking-wide text-gold-dark hover:text-gold">
                            Bearbeiten
                          </Link>
                          <DeleteButton action={del} confirm={`Einsatz vom ${j.date.toLocaleDateString("de-DE")} wirklich löschen?`} />
                        </div>
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

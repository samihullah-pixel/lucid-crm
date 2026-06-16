import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CleaningJobsPage() {
  const jobs = await prisma.cleaningJob.findMany({
    orderBy: { date: "desc" },
    include: { customer: true, property: true, employee: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Einsaetze</h1>
          <p className="font-sans text-sm font-light text-grey">Alle durchgefuehrten und geplanten Einsaetze.</p>
        </div>
        <Link
          href="/cleaning-jobs/new"
          className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 text-[11px] font-sans uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
        >
          Neuer Einsatz
        </Link>
      </div>
      <div className="border border-gold/20 bg-white p-6">
        {jobs.length === 0 ? (
          <p className="font-sans text-sm font-light text-grey">Noch keine Einsaetze vorhanden.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-grey text-[11px] uppercase tracking-wide">
                <th className="py-2 pr-4">Datum</th>
                <th className="py-2 pr-4">Kunde</th>
                <th className="py-2 pr-4">Objekt</th>
                <th className="py-2 pr-4">Mitarbeiter</th>
                <th className="py-2 pr-4">Art</th>
                <th className="py-2 pr-4">Stunden</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className="border-b border-black/10 last:border-0">
                  <td className="py-2 pr-4">{j.date.toLocaleDateString("de-DE")}</td>
                  <td className="py-2 pr-4">{j.customer.companyName}</td>
                  <td className="py-2 pr-4">{j.property.name}</td>
                  <td className="py-2 pr-4">
                    {j.employee ? `${j.employee.firstName} ${j.employee.lastName}` : "-"}
                  </td>
                  <td className="py-2 pr-4">{j.serviceType}</td>
                  <td className="py-2 pr-4">{j.workedHours?.toString() ?? "-"}</td>
                  <td className="py-2 pr-4">{j.status}</td>
                  <td className="py-2 pr-4">
                    <Link href={`/cleaning-jobs/${j.id}/edit`} className="font-sans text-xs uppercase tracking-wide text-gold-dark hover:text-gold">
                      Bearbeiten
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

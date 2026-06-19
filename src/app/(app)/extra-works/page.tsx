import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ExtraWorksPage() {
  const extraWorks = await prisma.extraWork.findMany({
    orderBy: { date: "desc" },
    include: { customer: true, property: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Zusatzarbeiten</h1>
          <p className="font-sans text-sm font-light text-grey">Extraleistungen, die noch oder schon abgerechnet wurden.</p>
        </div>
        <Link
          href="/extra-works/new"
          className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 text-[11px] font-sans uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
        >
          Neue Zusatzarbeit
        </Link>
      </div>
      <div className="rounded-lg border border-gold/20 bg-white p-6">
        {extraWorks.length === 0 ? (
          <p className="font-sans text-sm font-light text-grey">Noch keine Zusatzarbeiten vorhanden.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-grey text-[11px] uppercase tracking-wide">
                <th className="py-2 pr-4">Datum</th>
                <th className="py-2 pr-4">Kunde</th>
                <th className="py-2 pr-4">Beschreibung</th>
                <th className="py-2 pr-4">Betrag</th>
                <th className="py-2 pr-4">Abgerechnet</th>
              </tr>
            </thead>
            <tbody>
              {extraWorks.map((e) => {
                const amount =
                  e.billingType === "PAUSCHAL"
                    ? e.flatRatePrice?.toString()
                    : e.hours && e.hourlyRate
                    ? (Number(e.hours) * Number(e.hourlyRate)).toFixed(2)
                    : "-";
                return (
                  <tr key={e.id} className="border-b border-black/10 last:border-0">
                    <td className="py-2 pr-4">{e.date.toLocaleDateString("de-DE")}</td>
                    <td className="py-2 pr-4">{e.customer.companyName}</td>
                    <td className="py-2 pr-4">{e.description}</td>
                    <td className="py-2 pr-4">{amount} EUR</td>
                    <td className="py-2 pr-4">{e.alreadyInvoiced ? "Ja" : "Nein"}</td>
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

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { invoiceDate: "desc" },
    include: { customer: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Rechnungen</h1>
          <p className="font-sans text-sm font-light text-grey">Alle erstellten Rechnungen im Ueberblick.</p>
        </div>
        <Link
          href="/invoices/new"
          className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 text-[11px] font-sans uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
        >
          Neue Rechnung
        </Link>
      </div>
      <div className="border border-gold/20 bg-white p-6">
        {invoices.length === 0 ? (
          <p className="font-sans text-sm font-light text-grey">Noch keine Rechnungen vorhanden.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-grey text-[11px] uppercase tracking-wide">
                <th className="py-2 pr-4">Nr.</th>
                <th className="py-2 pr-4">Kunde</th>
                <th className="py-2 pr-4">Datum</th>
                <th className="py-2 pr-4">Brutto</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-black/10 last:border-0">
                  <td className="py-2 pr-4">{inv.invoiceNumber}</td>
                  <td className="py-2 pr-4">{inv.customer.companyName}</td>
                  <td className="py-2 pr-4">{inv.invoiceDate.toLocaleDateString("de-DE")}</td>
                  <td className="py-2 pr-4">{inv.grossAmount.toString()} EUR</td>
                  <td className="py-2 pr-4">{inv.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}

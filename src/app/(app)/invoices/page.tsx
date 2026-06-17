import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteInvoice } from "@/actions/invoices";
import { DeleteButton } from "@/components/ui/delete-button";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { invoiceDate: "desc" },
    include: { customer: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Rechnungen</h1>
          <p className="font-sans text-sm font-light text-grey">Alle erstellten Rechnungen im Überblick.</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/api/export?type=invoices"
            className="rounded border border-gold/30 px-4 py-2 font-sans text-[11px] uppercase tracking-[2px] text-grey hover:border-gold hover:text-gold"
          >
            CSV Export
          </a>
          <Link
            href="/invoices/new"
            className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
          >
            + Neue Rechnung
          </Link>
        </div>
      </div>
      <div className="border border-gold/20 bg-white p-6">
        {invoices.length === 0 ? (
          <p className="font-sans text-sm font-light text-grey">Noch keine Rechnungen vorhanden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-[11px] uppercase tracking-wide text-grey">
                  <th className="py-2 pr-4">Nr.</th>
                  <th className="py-2 pr-4">Kunde</th>
                  <th className="py-2 pr-4">Datum</th>
                  <th className="py-2 pr-4">Brutto</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4" />
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const del = deleteInvoice.bind(null, inv.id);
                  return (
                    <tr key={inv.id} className="border-b border-black/10 last:border-0 hover:bg-light/40">
                      <td className="py-2 pr-4 font-mono text-xs">{inv.invoiceNumber}</td>
                      <td className="py-2 pr-4">{inv.customer.companyName}</td>
                      <td className="py-2 pr-4">{inv.invoiceDate.toLocaleDateString("de-DE")}</td>
                      <td className="py-2 pr-4 font-medium">{Number(inv.grossAmount).toFixed(2)} €</td>
                      <td className="py-2 pr-4 text-xs text-grey">{inv.status}</td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-4">
                          <Link href={`/invoices/${inv.id}/edit`} className="font-sans text-[11px] uppercase tracking-wide text-gold-dark hover:text-gold">
                            Öffnen
                          </Link>
                          <a href={`/api/invoice-pdf?invoiceId=${inv.id}`} target="_blank" rel="noopener noreferrer" className="font-sans text-[11px] uppercase tracking-wide text-grey hover:text-gold">
                            PDF
                          </a>
                          <DeleteButton action={del} confirm={`Rechnung ${inv.invoiceNumber} wirklich löschen?`} />
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

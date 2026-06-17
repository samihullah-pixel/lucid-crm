import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteCustomer } from "@/actions/customers";
import { DeleteButton } from "@/components/ui/delete-button";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Kunden</h1>
          <p className="font-sans text-sm font-light text-grey">Verwalte alle Kunden und ihre Stammdaten.</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/api/export?type=customers"
            className="rounded border border-gold/30 px-4 py-2 font-sans text-[11px] uppercase tracking-[2px] text-grey hover:border-gold hover:text-gold"
          >
            CSV Export
          </a>
          <Link
            href="/customers/new"
            className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
          >
            + Neuer Kunde
          </Link>
        </div>
      </div>
      <div className="border border-gold/20 bg-white p-6">
        {customers.length === 0 ? (
          <p className="font-sans text-sm font-light text-grey">Noch keine Kunden vorhanden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-[11px] uppercase tracking-wide text-grey">
                  <th className="py-2 pr-4">Kd.-Nr.</th>
                  <th className="py-2 pr-4">Firma</th>
                  <th className="py-2 pr-4">Ansprechpartner</th>
                  <th className="py-2 pr-4">E-Mail</th>
                  <th className="py-2 pr-4">Telefon</th>
                  <th className="py-2 pr-4" />
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const del = deleteCustomer.bind(null, c.id);
                  return (
                    <tr key={c.id} className="border-b border-black/10 last:border-0 hover:bg-light/40">
                      <td className="py-2 pr-4">{c.customerNumber}</td>
                      <td className="py-2 pr-4">{c.companyName}</td>
                      <td className="py-2 pr-4">{c.contactPerson ?? "—"}</td>
                      <td className="py-2 pr-4">{c.email ?? "—"}</td>
                      <td className="py-2 pr-4">{c.phone ?? "—"}</td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-4">
                          <Link href={`/customers/${c.id}/edit`} className="font-sans text-[11px] uppercase tracking-wide text-gold-dark hover:text-gold">
                            Öffnen
                          </Link>
                          <DeleteButton action={del} confirm={`Kunde "${c.companyName}" wirklich löschen?`} />
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

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
      <div className="overflow-hidden rounded-lg border border-gold/20 bg-white">
        {customers.length === 0 ? (
          <p className="p-6 font-sans text-sm font-light text-grey">Noch keine Kunden vorhanden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-[10px] uppercase tracking-[2px] text-grey">
                  <th className="px-6 py-3.5 font-normal">Kunde</th>
                  <th className="px-6 py-3.5 font-normal">Ansprechpartner</th>
                  <th className="px-6 py-3.5 font-normal">E-Mail</th>
                  <th className="px-6 py-3.5 font-normal">Telefon</th>
                  <th className="px-6 py-3.5 font-normal">Status</th>
                  <th className="px-6 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const del = deleteCustomer.bind(null, c.id);
                  const initials = c.companyName
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase();
                  return (
                    <tr key={c.id} className="border-b border-black/5 last:border-0 transition-colors hover:bg-light/60">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-gold/20 bg-light text-[12px] tracking-wide text-gold-dark">
                            {initials}
                          </span>
                          <div>
                            <div className="font-sans text-black">{c.companyName}</div>
                            <div className="font-sans text-[11px] tracking-wide text-grey">{c.customerNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-grey">{c.contactPerson ?? "—"}</td>
                      <td className="px-6 py-4 text-grey">{c.email ?? "—"}</td>
                      <td className="px-6 py-4 text-grey">{c.phone ?? "—"}</td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            c.isActive
                              ? "rounded-full bg-gold/15 px-3 py-1 text-[10px] uppercase tracking-[1.5px] text-gold-dark"
                              : "rounded-full bg-black/5 px-3 py-1 text-[10px] uppercase tracking-[1.5px] text-grey"
                          }
                        >
                          {c.isActive ? "Aktiv" : "Inaktiv"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <Link href={`/customers/${c.id}/edit`} className="font-sans text-[11px] uppercase tracking-wide text-gold-dark hover:text-gold">
                            Öffnen
                          </Link>
                          <DeleteButton action={del} confirm={`Kunde "${c.companyName}" wirklich löschen?`} successMessage="Kunde gelöscht" />
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

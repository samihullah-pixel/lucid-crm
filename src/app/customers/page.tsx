import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Kunden</h1>
          <p className="font-sans text-sm font-light text-grey">
            Verwalte alle Kunden und ihre Stammdaten.
          </p>
        </div>
        <Link
          href="/customers/new"
          className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 text-[11px] font-sans uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
        >
          Neuer Kunde
        </Link>
      </div>
      <div className="border border-gold/20 bg-white p-6">
        {customers.length === 0 ? (
          <p className="font-sans text-sm font-light text-grey">Noch keine Kunden vorhanden.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-grey text-[11px] uppercase tracking-wide">
                <th className="py-2 pr-4">Kd.-Nr.</th>
                <th className="py-2 pr-4">Firma</th>
                <th className="py-2 pr-4">Ansprechpartner</th>
                <th className="py-2 pr-4">E-Mail</th>
                <th className="py-2 pr-4">Telefon</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-black/10 last:border-0">
                  <td className="py-2 pr-4">{customer.customerNumber}</td>
                  <td className="py-2 pr-4">{customer.companyName}</td>
                  <td className="py-2 pr-4">{customer.contactPerson}</td>
                  <td className="py-2 pr-4">{customer.email}</td>
                  <td className="py-2 pr-4">{customer.phone}</td>
                  <td className="py-2 pr-4">
                    <Link href={`/customers/${customer.id}/edit`} className="font-sans text-xs uppercase tracking-wide text-gold-dark hover:text-gold">
                      Oeffnen
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

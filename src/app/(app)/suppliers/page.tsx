import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteSupplier } from "@/actions/suppliers";
import { DeleteButton } from "@/components/ui/delete-button";

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Lieferanten</h1>
          <p className="font-sans text-sm font-light text-grey">Verwalte Lieferanten und ihre Produkte.</p>
        </div>
        <Link
          href="/suppliers/new"
          className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
        >
          + Neuer Lieferant
        </Link>
      </div>
      <div className="border border-gold/20 bg-white p-6">
        {suppliers.length === 0 ? (
          <p className="font-sans text-sm font-light text-grey">Noch keine Lieferanten vorhanden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-[11px] uppercase tracking-wide text-grey">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">E-Mail</th>
                  <th className="py-2 pr-4">Telefon</th>
                  <th className="py-2 pr-4">Produkte</th>
                  <th className="py-2 pr-4" />
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => {
                  const del = deleteSupplier.bind(null, s.id);
                  return (
                    <tr key={s.id} className="border-b border-black/10 last:border-0 hover:bg-light/40">
                      <td className="py-2 pr-4 font-medium">{s.name}</td>
                      <td className="py-2 pr-4">{s.email}</td>
                      <td className="py-2 pr-4">{s.phone ?? "—"}</td>
                      <td className="py-2 pr-4">{s._count.products}</td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-4">
                          <Link href={`/suppliers/${s.id}/edit`} className="font-sans text-[11px] uppercase tracking-wide text-gold-dark hover:text-gold">
                            Öffnen
                          </Link>
                          <DeleteButton action={del} confirm={`Lieferant "${s.name}" wirklich löschen?`} />
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

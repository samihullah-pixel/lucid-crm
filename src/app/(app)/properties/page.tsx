import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProperty } from "@/actions/properties";
import { DeleteButton } from "@/components/ui/delete-button";

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Objekte</h1>
          <p className="font-sans text-sm font-light text-grey">Alle Einsatzorte deiner Kunden.</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/api/export?type=properties"
            className="rounded border border-gold/30 px-4 py-2 font-sans text-[11px] uppercase tracking-[2px] text-grey hover:border-gold hover:text-gold"
          >
            CSV Export
          </a>
          <Link
            href="/properties/new"
            className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
          >
            + Neues Objekt
          </Link>
        </div>
      </div>
      <div className="rounded-lg border border-gold/20 bg-white p-6">
        {properties.length === 0 ? (
          <p className="font-sans text-sm font-light text-grey">Noch keine Objekte vorhanden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-[10px] uppercase tracking-[2px] text-grey">
                  <th className="py-2 pr-4">Objekt</th>
                  <th className="py-2 pr-4">Kunde</th>
                  <th className="py-2 pr-4">Adresse</th>
                  <th className="py-2 pr-4">Ort</th>
                  <th className="py-2 pr-4" />
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => {
                  const del = deleteProperty.bind(null, p.id);
                  return (
                    <tr key={p.id} className="border-b border-black/5 last:border-0 transition-colors hover:bg-light/60">
                      <td className="py-2 pr-4">{p.name}</td>
                      <td className="py-2 pr-4">{p.customer.companyName}</td>
                      <td className="py-2 pr-4">{p.address}</td>
                      <td className="py-2 pr-4">{p.city ?? "—"}</td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-4">
                          <Link href={`/properties/${p.id}/edit`} className="font-sans text-[11px] uppercase tracking-wide text-gold-dark hover:text-gold">
                            Öffnen
                          </Link>
                          <DeleteButton action={del} confirm={`Objekt "${p.name}" wirklich löschen?`} />
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

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deletePartner } from "@/actions/partners";
import { DeleteButton } from "@/components/ui/delete-button";

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { requests: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Partner</h1>
          <p className="font-sans text-sm font-light text-grey">
            Externe Dienstleister / Subunternehmer für Fremdleistungen.
          </p>
        </div>
        <Link
          href="/partners/new"
          className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
        >
          + Neuer Partner
        </Link>
      </div>
      <div className="rounded-lg border border-gold/20 bg-white p-6">
        {partners.length === 0 ? (
          <p className="font-sans text-sm font-light text-grey">Noch keine Partner vorhanden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-[10px] uppercase tracking-[2px] text-grey">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Leistungen</th>
                  <th className="py-2 pr-4">E-Mail</th>
                  <th className="py-2 pr-4">Anfragen</th>
                  <th className="py-2 pr-4" />
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => {
                  const del = deletePartner.bind(null, p.id);
                  return (
                    <tr key={p.id} className="border-b border-black/5 last:border-0 transition-colors hover:bg-light/60">
                      <td className="py-2 pr-4 font-medium">
                        {p.name}
                        {!p.isActive && <span className="ml-2 text-[10px] uppercase text-grey">(inaktiv)</span>}
                      </td>
                      <td className="py-2 pr-4">{p.serviceArea ?? "—"}</td>
                      <td className="py-2 pr-4">{p.email}</td>
                      <td className="py-2 pr-4">{p._count.requests}</td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-4">
                          <Link href={`/partners/${p.id}/edit`} className="font-sans text-[11px] uppercase tracking-wide text-gold-dark hover:text-gold">
                            Öffnen
                          </Link>
                          <DeleteButton action={del} confirm={`Partner "${p.name}" wirklich löschen?`} />
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

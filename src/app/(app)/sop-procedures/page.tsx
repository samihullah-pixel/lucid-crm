import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProceduresPage() {
  const procedures = await prisma.procedure.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { steps: true, equipment: true, sites: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Anleitungen</h1>
          <p className="font-sans text-sm font-light text-grey">
            Vor-Ort-Anleitungen für Einsätze · per QR ohne Login abrufbar.
          </p>
        </div>
        <Link
          href="/sop-procedures/new"
          className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
        >
          + Neu
        </Link>
      </div>

      {procedures.length === 0 ? (
        <p className="font-sans text-sm text-grey">Noch keine Anleitungen vorhanden.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gold/20 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/10 text-[10px] uppercase tracking-[2px] text-grey">
                <th className="px-6 py-4 text-left font-light">Anleitung</th>
                <th className="px-6 py-4 text-left font-light">Schritte</th>
                <th className="px-6 py-4 text-left font-light">Equipment</th>
                <th className="px-6 py-4 text-left font-light">Standorte</th>
              </tr>
            </thead>
            <tbody>
              {procedures.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-black/5 last:border-0 transition-colors hover:bg-light/60"
                >
                  <td className="px-6 py-4">
                    <Link href={`/sop-procedures/${p.id}/edit`} className="font-sans text-sm text-black hover:text-gold-dark">
                      {p.name}
                    </Link>
                    {p.description && (
                      <p className="font-sans text-xs text-grey">{p.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 font-sans text-sm text-grey">{p._count.steps}</td>
                  <td className="px-6 py-4 font-sans text-sm text-grey">{p._count.equipment}</td>
                  <td className="px-6 py-4 font-sans text-sm text-grey">{p._count.sites}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

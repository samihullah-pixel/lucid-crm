import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProceduresTable } from "@/components/sop/procedures-table";

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
        <ProceduresTable procedures={procedures} />
      )}
    </div>
  );
}

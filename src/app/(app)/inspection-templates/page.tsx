import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function InspectionTemplatesPage() {
  const templates = await prisma.inspectionTemplate.findMany({
    include: { property: true, areas: { include: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-black">Aufnahmebögen</h1>
          <p className="font-sans text-sm font-light text-grey">Reinigungspläne mit Bereichen und Intervallen.</p>
        </div>
        <Link
          href="/inspection-templates/new"
          className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
        >
          + Neu
        </Link>
      </div>

      {templates.length === 0 ? (
        <p className="font-sans text-sm text-grey">Noch keine Aufnahmebögen vorhanden.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border border-gold/20 bg-white">
            <thead>
              <tr className="border-b border-gold/20">
                <th className="px-4 py-3 text-left font-sans text-[10px] uppercase tracking-wide text-grey">Name</th>
                <th className="px-4 py-3 text-left font-sans text-[10px] uppercase tracking-wide text-grey">Objekt</th>
                <th className="px-4 py-3 text-left font-sans text-[10px] uppercase tracking-wide text-grey">Bereiche</th>
                <th className="px-4 py-3 text-left font-sans text-[10px] uppercase tracking-wide text-grey">Punkte</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => {
                const itemCount = t.areas.reduce((sum, a) => sum + a.items.length, 0);
                return (
                  <tr key={t.id} className="border-b border-gold/10 hover:bg-light/50">
                    <td className="px-4 py-3 font-sans text-sm">{t.name}</td>
                    <td className="px-4 py-3 font-sans text-sm text-grey">{t.property?.name ?? "—"}</td>
                    <td className="px-4 py-3 font-sans text-sm text-grey">{t.areas.length}</td>
                    <td className="px-4 py-3 font-sans text-sm text-grey">{itemCount}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-4">
                        <Link href={`/inspection-templates/${t.id}/edit`} className="font-sans text-[11px] uppercase tracking-wide text-grey hover:text-gold">
                          Bearbeiten
                        </Link>
                        <a
                          href={`/api/inspection-pdf?templateId=${t.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-sans text-[11px] uppercase tracking-wide text-grey hover:text-gold"
                        >
                          PDF
                        </a>
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
  );
}

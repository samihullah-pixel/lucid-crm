import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteInspectionTemplate } from "@/actions/inspection-templates";
import { DeleteButton } from "@/components/ui/delete-button";

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
                const del = deleteInspectionTemplate.bind(null, t.id);
                return (
                  <tr key={t.id} className="border-b border-gold/10 hover:bg-light/50">
                    <td className="px-4 py-3 font-sans text-sm">{t.name}</td>
                    <td className="px-4 py-3 font-sans text-sm text-grey">{t.property?.name ?? "—"}</td>
                    <td className="px-4 py-3 font-sans text-sm text-grey">{t.areas.length}</td>
                    <td className="px-4 py-3 font-sans text-sm text-grey">{itemCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/inspection-templates/${t.id}/edit`}
                          className="font-sans text-[11px] uppercase tracking-wide text-grey hover:text-gold"
                        >
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
                        <DeleteButton
                          action={del}
                          confirm={`"${t.name}" wirklich löschen?`}
                          label={
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                            </svg>
                          }
                        />
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

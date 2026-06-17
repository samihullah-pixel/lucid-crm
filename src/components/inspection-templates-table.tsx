"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteInspectionTemplate } from "@/actions/inspection-templates";

type Template = {
  id: string;
  name: string;
  propertyName: string | null;
  areaCount: number;
  itemCount: number;
};

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
  </svg>
);

export function InspectionTemplatesTable({ templates }: { templates: Template[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const allChecked = selected.size === templates.length && templates.length > 0;

  function toggleAll() {
    setSelected(allChecked ? new Set() : new Set(templates.map((t) => t.id)));
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function deleteSelected() {
    const ids = Array.from(selected);
    const names = templates.filter((t) => ids.includes(t.id)).map((t) => t.name).join(", ");
    if (!confirm(`${ids.length} Aufnahmebogen löschen?\n\n${names}`)) return;
    startTransition(async () => {
      for (const id of ids) {
        await deleteInspectionTemplate(id);
      }
      setSelected(new Set());
    });
  }

  function deleteSingle(id: string, name: string) {
    if (!confirm(`"${name}" wirklich löschen?`)) return;
    startTransition(async () => {
      await deleteInspectionTemplate(id);
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    });
  }

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div className="flex items-center gap-4 rounded border border-red-200 bg-red-50 px-4 py-2">
          <span className="font-sans text-sm text-red-700">{selected.size} ausgewählt</span>
          <button
            onClick={deleteSelected}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-1.5 font-sans text-[11px] uppercase tracking-[2px] text-white hover:bg-red-700 disabled:opacity-50"
          >
            <TrashIcon />
            Auswahl löschen
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="font-sans text-[11px] text-grey hover:text-black"
          >
            Abwählen
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border border-gold/20 bg-white">
          <thead>
            <tr className="border-b border-gold/20">
              <th className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="h-4 w-4 cursor-pointer accent-gold"
                />
              </th>
              <th className="px-4 py-3 text-left font-sans text-[10px] uppercase tracking-wide text-grey">Name</th>
              <th className="px-4 py-3 text-left font-sans text-[10px] uppercase tracking-wide text-grey">Objekt</th>
              <th className="px-4 py-3 text-left font-sans text-[10px] uppercase tracking-wide text-grey">Bereiche</th>
              <th className="px-4 py-3 text-left font-sans text-[10px] uppercase tracking-wide text-grey">Punkte</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr
                key={t.id}
                className={`border-b border-gold/10 transition-colors ${selected.has(t.id) ? "bg-gold/5" : "hover:bg-light/50"}`}
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(t.id)}
                    onChange={() => toggle(t.id)}
                    className="h-4 w-4 cursor-pointer accent-gold"
                  />
                </td>
                <td className="px-4 py-3 font-sans text-sm">{t.name}</td>
                <td className="px-4 py-3 font-sans text-sm text-grey">{t.propertyName ?? "—"}</td>
                <td className="px-4 py-3 font-sans text-sm text-grey">{t.areaCount}</td>
                <td className="px-4 py-3 font-sans text-sm text-grey">{t.itemCount}</td>
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
                    <button
                      onClick={() => deleteSingle(t.id, t.name)}
                      disabled={isPending}
                      className="text-grey hover:text-red-500 disabled:opacity-40"
                      title="Löschen"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

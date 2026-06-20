"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, X } from "lucide-react";
import { deleteProcedures } from "@/actions/procedures";

type Row = {
  id: string;
  name: string;
  description: string | null;
  _count: { steps: number; equipment: number; sites: number };
};

export function ProceduresTable({ procedures }: { procedures: Row[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const allSelected = procedures.length > 0 && selected.size === procedures.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(procedures.map((p) => p.id)));
  }

  function removeSelected() {
    const ids = [...selected];
    if (ids.length === 0) return;
    const withSites = procedures.filter((p) => ids.includes(p.id) && p._count.sites > 0);
    const warn = withSites.length
      ? `\n\nAchtung: ${withSites.length} davon ${withSites.length === 1 ? "ist einem Standort" : "sind Standorten"} zugewiesen — die QR-Codes werden ungültig.`
      : "";
    if (!confirm(`${ids.length} Anleitung(en) wirklich löschen?${warn}`)) return;

    startTransition(async () => {
      await deleteProcedures(ids);
      setSelected(new Set());
      toast.success(`${ids.length} Anleitung(en) gelöscht`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {/* AUSWAHL-LEISTE */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-gold/30 bg-light px-4 py-3">
          <span className="font-sans text-sm text-black">
            {selected.size} ausgewählt
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelected(new Set())}
              className="flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 font-sans text-[11px] uppercase tracking-[2px] text-grey hover:bg-white"
            >
              <X className="h-3.5 w-3.5" /> Abbrechen
            </button>
            <button
              onClick={removeSelected}
              disabled={pending}
              className="flex items-center gap-1.5 rounded-full bg-[#b3402f] px-4 py-2 font-sans text-[11px] uppercase tracking-[2px] text-white hover:bg-[#9a3527] disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> {pending ? "Löscht…" : "Löschen"}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gold/20 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/10 text-[10px] uppercase tracking-[2px] text-grey">
              <th className="w-10 px-4 py-4 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Alle auswählen"
                  className="h-4 w-4 cursor-pointer accent-gold-dark"
                />
              </th>
              <th className="px-6 py-4 text-left font-light">Anleitung</th>
              <th className="px-6 py-4 text-left font-light">Schritte</th>
              <th className="px-6 py-4 text-left font-light">Equipment</th>
              <th className="px-6 py-4 text-left font-light">Standorte</th>
            </tr>
          </thead>
          <tbody>
            {procedures.map((p) => {
              const isSel = selected.has(p.id);
              return (
                <tr
                  key={p.id}
                  className={`border-b border-black/5 last:border-0 transition-colors ${
                    isSel ? "bg-light" : "hover:bg-light/60"
                  }`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={() => toggle(p.id)}
                      aria-label={`${p.name} auswählen`}
                      className="h-4 w-4 cursor-pointer accent-gold-dark"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/sop-procedures/${p.id}/edit`}
                      className="font-sans text-sm text-black hover:text-gold-dark"
                    >
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

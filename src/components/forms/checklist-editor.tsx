"use client";

import { useState } from "react";
import { saveChecklist } from "@/actions/checklist";
import { COLLAB_TEMPLATE, checklistToText } from "@/lib/checklist";

export function ChecklistEditor({
  propertyId,
  initialText,
}: {
  propertyId: string;
  initialText: string;
}) {
  const [text, setText] = useState(initialText);
  const action = saveChecklist.bind(null, propertyId);

  return (
    <form action={action} className="border border-gold/20 bg-white p-6">
      <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">
        Checkliste
      </label>
      <textarea
        name="items"
        rows={20}
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        className="w-full rounded border border-black/15 px-3 py-2 font-mono text-sm focus:border-gold focus:outline-none"
        placeholder={"## Abschnitt\nErster Punkt\nZweiter Punkt"}
      />
      <p className="mt-2 font-sans text-xs font-light text-grey">
        Eine Zeile pro Punkt. Zeilen mit „## “ am Anfang sind Abschnittsüberschriften. Die Mitarbeiter sehen die Liste auf Englisch, so wie du sie hier schreibst.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 text-[11px] font-sans uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
        >
          Checkliste speichern
        </button>
        <button
          type="button"
          onClick={() => {
            if (!text.trim() || window.confirm("Aktuellen Text durch die COLLAB-Vorlage ersetzen?")) {
              setText(checklistToText(COLLAB_TEMPLATE));
            }
          }}
          className="font-sans text-[11px] uppercase tracking-wide text-gold-dark hover:text-gold"
        >
          COLLAB-Vorlage einfügen
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";
import { saveInspectionAreas } from "@/actions/inspection-templates";

const INTERVALS = [
  { value: "TAEGLICH", label: "Täglich" },
  { value: "WOECHENTLICH", label: "Wöchentlich" },
  { value: "ZWEIWOECHENTLICH", label: "2-wöchentlich" },
  { value: "MONATLICH", label: "Monatlich" },
  { value: "NACH_BEDARF", label: "Nach Bedarf" },
  { value: "QUARTAL", label: "Quartalsweise" },
  { value: "HALBJAHR", label: "Halbjährlich" },
  { value: "JAEHRLICH", label: "Jährlich" },
];

type Item = { id?: string; label: string; interval: string; order: number };
type Area = { id?: string; name: string; order: number; items: Item[] };

function uid() {
  return Math.random().toString(36).slice(2);
}

const CAFE_DEFAULTS: Area[] = [
  {
    name: "Außenbereich",
    order: 0,
    items: [
      { label: "Eingangsbereiche fegen / kehren", interval: "TAEGLICH", order: 0 },
      { label: "Außenmöbel abwischen", interval: "WOECHENTLICH", order: 1 },
      { label: "Eingangsbereich Glas reinigen", interval: "WOECHENTLICH", order: 2 },
      { label: "Aschenbecher / Abfallbehälter leeren und reinigen", interval: "TAEGLICH", order: 3 },
    ],
  },
  {
    name: "Café-Fläche / Gästeraum",
    order: 1,
    items: [
      { label: "Tische und Stühle abwischen", interval: "TAEGLICH", order: 0 },
      { label: "Boden saugen und wischen", interval: "TAEGLICH", order: 1 },
      { label: "Fenster und Glasflächen reinigen", interval: "WOECHENTLICH", order: 2 },
      { label: "Sockelleisten abwischen", interval: "MONATLICH", order: 3 },
      { label: "Deckenleuchten / Lampenschirme abstauben", interval: "MONATLICH", order: 4 },
    ],
  },
  {
    name: "Bar-Tresen (hinter)",
    order: 2,
    items: [
      { label: "Edelstahlgebürstete Fronten reinigen und polieren", interval: "TAEGLICH", order: 0 },
      { label: "Kaffeemaschine und Gerätefront abwischen", interval: "TAEGLICH", order: 1 },
      { label: "Arbeitsflächen desinfizieren", interval: "TAEGLICH", order: 2 },
      { label: "Boden hinter Tresen fegen und wischen", interval: "TAEGLICH", order: 3 },
      { label: "Kühlschrank-Dichtungen reinigen", interval: "WOECHENTLICH", order: 4 },
      { label: "Edelstahlgeräte tiefenreinigen", interval: "MONATLICH", order: 5 },
    ],
  },
  {
    name: "Küche (eine Ebene)",
    order: 3,
    items: [
      { label: "Arbeitsflächen reinigen und desinfizieren", interval: "TAEGLICH", order: 0 },
      { label: "Herd / Kochfelder entfetten", interval: "TAEGLICH", order: 1 },
      { label: "Frittierfett kontrollieren / Bereich reinigen", interval: "WOECHENTLICH", order: 2 },
      { label: "Spülbereich reinigen und desinfizieren", interval: "TAEGLICH", order: 3 },
      { label: "Boden fegen und wischen", interval: "TAEGLICH", order: 4 },
      { label: "Dunstabzug / Filter reinigen", interval: "MONATLICH", order: 5 },
      { label: "Kühlschrank / Kühlzelle reinigen", interval: "WOECHENTLICH", order: 6 },
      { label: "Backofen reinigen", interval: "WOECHENTLICH", order: 7 },
      { label: "Edelstahlfronten polieren", interval: "TAEGLICH", order: 8 },
    ],
  },
  {
    name: "Gäste-WC",
    order: 4,
    items: [
      { label: "Toiletten desinfizieren", interval: "TAEGLICH", order: 0 },
      { label: "Waschbecken und Armaturen reinigen", interval: "TAEGLICH", order: 1 },
      { label: "Boden wischen und desinfizieren", interval: "TAEGLICH", order: 2 },
      { label: "Verbrauchsmaterial auffüllen (Seife, Papier)", interval: "TAEGLICH", order: 3 },
      { label: "Spiegel reinigen", interval: "TAEGLICH", order: 4 },
      { label: "Abfallbehälter leeren", interval: "TAEGLICH", order: 5 },
    ],
  },
  {
    name: "Personal-WC",
    order: 5,
    items: [
      { label: "Toilette desinfizieren", interval: "TAEGLICH", order: 0 },
      { label: "Waschbecken und Armaturen reinigen", interval: "TAEGLICH", order: 1 },
      { label: "Boden wischen", interval: "TAEGLICH", order: 2 },
      { label: "Verbrauchsmaterial auffüllen", interval: "TAEGLICH", order: 3 },
    ],
  },
  {
    name: "Lagerräume",
    order: 6,
    items: [
      { label: "Boden fegen und wischen", interval: "WOECHENTLICH", order: 0 },
      { label: "Regale abstauben", interval: "MONATLICH", order: 1 },
      { label: "Ordnung kontrollieren / Abfälle entsorgen", interval: "WOECHENTLICH", order: 2 },
    ],
  },
];

export function InspectionTemplateEditor({
  templateId,
  initialAreas,
  isNew,
}: {
  templateId: string;
  initialAreas: Area[];
  isNew: boolean;
}) {
  const [areas, setAreas] = useState<Area[]>(
    initialAreas.length === 0 && isNew
      ? CAFE_DEFAULTS.map((a) => ({ ...a, items: a.items.map((i) => ({ ...i })) }))
      : initialAreas
  );
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function addArea() {
    setAreas((prev) => [...prev, { name: "", order: prev.length, items: [] }]);
    setSaved(false);
  }

  function removeArea(idx: number) {
    setAreas((prev) => prev.filter((_, i) => i !== idx));
    setSaved(false);
  }

  function updateAreaName(idx: number, name: string) {
    setAreas((prev) => prev.map((a, i) => (i === idx ? { ...a, name } : a)));
    setSaved(false);
  }

  function addItem(areaIdx: number) {
    setAreas((prev) =>
      prev.map((a, i) =>
        i === areaIdx
          ? { ...a, items: [...a.items, { label: "", interval: "TAEGLICH", order: a.items.length }] }
          : a
      )
    );
    setSaved(false);
  }

  function removeItem(areaIdx: number, itemIdx: number) {
    setAreas((prev) =>
      prev.map((a, i) =>
        i === areaIdx ? { ...a, items: a.items.filter((_, j) => j !== itemIdx) } : a
      )
    );
    setSaved(false);
  }

  function updateItem(areaIdx: number, itemIdx: number, field: "label" | "interval", value: string) {
    setAreas((prev) =>
      prev.map((a, i) =>
        i === areaIdx
          ? {
              ...a,
              items: a.items.map((item, j) =>
                j === itemIdx ? { ...item, [field]: value } : item
              ),
            }
          : a
      )
    );
    setSaved(false);
  }

  function save() {
    startTransition(async () => {
      await saveInspectionAreas(
        templateId,
        areas.map((a, i) => ({
          id: a.id,
          name: a.name,
          order: i,
          items: a.items.map((item, j) => ({
            id: item.id,
            label: item.label,
            interval: item.interval,
            order: j,
          })),
        }))
      );
      setSaved(true);
    });
  }

  return (
    <div className="space-y-4">
      {areas.map((area, areaIdx) => (
        <div key={areaIdx} className="border border-gold/20 bg-white">
          <div className="flex items-center gap-3 border-b border-gold/10 bg-light/40 px-4 py-3">
            <input
              value={area.name}
              onChange={(e) => updateAreaName(areaIdx, e.target.value)}
              placeholder="Bereichsname"
              className="flex-1 rounded border border-black/10 px-3 py-1.5 font-sans text-sm font-medium focus:border-gold focus:outline-none"
            />
            <button
              type="button"
              onClick={() => removeArea(areaIdx)}
              className="font-sans text-[11px] uppercase tracking-wide text-grey hover:text-red-500"
            >
              Entfernen
            </button>
          </div>

          <div className="p-4">
            {area.items.length === 0 && (
              <p className="mb-2 font-sans text-xs text-grey">Noch keine Punkte. Unten hinzufügen.</p>
            )}
            <div className="space-y-2">
              {area.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex items-center gap-2">
                  <input
                    value={item.label}
                    onChange={(e) => updateItem(areaIdx, itemIdx, "label", e.target.value)}
                    placeholder="Reinigungspunkt"
                    className="min-w-0 flex-1 rounded border border-black/10 px-2 py-1.5 font-sans text-sm focus:border-gold focus:outline-none"
                  />
                  <select
                    value={item.interval}
                    onChange={(e) => updateItem(areaIdx, itemIdx, "interval", e.target.value)}
                    className="w-40 rounded border border-black/10 px-2 py-1.5 font-sans text-xs focus:border-gold focus:outline-none"
                  >
                    {INTERVALS.map((iv) => (
                      <option key={iv.value} value={iv.value}>{iv.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeItem(areaIdx, itemIdx)}
                    className="font-sans text-lg leading-none text-grey hover:text-red-500"
                    title="Punkt entfernen"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addItem(areaIdx)}
              className="mt-3 font-sans text-[11px] uppercase tracking-wide text-grey hover:text-gold"
            >
              + Punkt hinzufügen
            </button>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="button"
          onClick={addArea}
          className="rounded border border-gold/30 px-4 py-2 font-sans text-[11px] uppercase tracking-[2px] text-grey hover:border-gold hover:text-gold"
        >
          + Bereich hinzufügen
        </button>

        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)] disabled:opacity-60"
        >
          {isPending ? "Speichern…" : "Speichern"}
        </button>

        {saved && (
          <span className="font-sans text-xs text-green-700">Gespeichert ✓</span>
        )}
      </div>
    </div>
  );
}

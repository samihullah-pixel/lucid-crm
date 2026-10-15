export type ParsedItem = { section: string; text: string };

/**
 * Editor-Format: Zeilen mit "## " beginnen einen Abschnitt, alle anderen
 * nicht-leeren Zeilen sind Checklistenpunkte darunter.
 */
export function parseChecklistText(input: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  let section = "General";
  for (const raw of input.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("##")) {
      section = line.replace(/^#+\s*/, "").trim() || section;
      continue;
    }
    items.push({ section, text: line });
  }
  return items;
}

export function checklistToText(items: ParsedItem[]): string {
  const lines: string[] = [];
  let current: string | null = null;
  for (const it of items) {
    if (it.section !== current) {
      if (lines.length) lines.push("");
      lines.push(`## ${it.section}`);
      current = it.section;
    }
    lines.push(it.text);
  }
  return lines.join("\n");
}

/** Startdaten: Checkliste COLLAB Cocktailbar. */
export const COLLAB_TEMPLATE: ParsedItem[] = [
  { section: "On arrival", text: "Sanitary cleaner applied to toilets, urinals, sinks – let it soak" },
  { section: "On arrival", text: "Bar mats lifted" },
  { section: "Floors", text: "Skirting boards in first room wiped" },
  { section: "Floors", text: "All floors swept / vacuumed" },
  { section: "Floors", text: "All floors mopped, incl. under bar mats – let dry" },
  { section: "Floors", text: "Table legs and base plates dried, no streaks" },
  { section: "Sanitary", text: "Toilets, urinals, sinks scrubbed and rinsed" },
  { section: "Sanitary", text: "Mirrors, taps, dispensers cleaned" },
  { section: "Sanitary", text: "Sanitary floors mopped" },
  { section: "Finish", text: "Handles and contact points disinfected" },
  { section: "Finish", text: "Bar mats left off the floor (not put back)" },
  { section: "Finish", text: "Equipment packed, lights off, door locked" },
];

export const MIN_PHOTOS = 3;

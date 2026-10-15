import { prisma } from "@/lib/prisma";
import {
  FLAG_LABELS,
  berlinMonthStart,
  formatDate,
  formatTime,
  minutesBetween,
} from "@/lib/time-entry";

export const dynamic = "force-dynamic";

/** Zelle für Excel (Semikolon-getrennt) – schützt vor Formel-Injection. */
function cell(value: string | number): string {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function hours(minutes: number): string {
  return (minutes / 60).toFixed(2).replace(".", ",");
}

/**
 * CSV für die Lohnabrechnung: ?month=YYYY-MM (Standard: aktueller Monat).
 * Standard = Stunden pro Mitarbeiter, &detail=1 = jede einzelne Schicht.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const now = new Date();
  const m = /^(\d{4})-(\d{2})$/.exec(params.get("month") ?? "");
  const year = m ? Number(m[1]) : now.getFullYear();
  const month = m ? Number(m[2]) : now.getMonth() + 1;
  const detail = params.get("detail") === "1";

  const entries = await prisma.timeEntry.findMany({
    where: {
      endedAt: { not: null },
      startedAt: { gte: berlinMonthStart(year, month), lt: berlinMonthStart(year, month + 1) },
    },
    include: {
      employee: { select: { firstName: true, lastName: true } },
      property: { select: { name: true } },
    },
    orderBy: [{ startedAt: "asc" }],
  });

  const label = `${year}-${String(month).padStart(2, "0")}`;
  let rows: (string | number)[][];

  if (detail) {
    rows = [
      ["Nr.", "Datum", "Mitarbeiter", "Objekt", "Start", "Ende", "Minuten", "Stunden", "Status", "Hinweise"],
      ...entries.map((e) => {
        const minutes = minutesBetween(e.startedAt, e.endedAt!);
        return [
          e.number,
          formatDate(e.startedAt),
          `${e.employee.firstName} ${e.employee.lastName}`,
          e.property.name,
          formatTime(e.startedAt),
          formatTime(e.endedAt!),
          minutes,
          hours(minutes),
          e.status === "REVIEW" ? "Prüfen" : "Erledigt",
          e.flags.map((f) => FLAG_LABELS[f] ?? f).join(" | "),
        ];
      }),
    ];
  } else {
    const byEmployee = new Map<string, { name: string; shifts: number; minutes: number; reviewMinutes: number }>();
    for (const e of entries) {
      const key = `${e.employee.lastName}, ${e.employee.firstName}`;
      const row = byEmployee.get(key) ?? { name: key, shifts: 0, minutes: 0, reviewMinutes: 0 };
      const minutes = minutesBetween(e.startedAt, e.endedAt!);
      row.shifts += 1;
      row.minutes += minutes;
      if (e.status === "REVIEW") row.reviewMinutes += minutes;
      byEmployee.set(key, row);
    }
    const list = Array.from(byEmployee.values()).sort((a, b) => a.name.localeCompare(b.name, "de"));
    rows = [
      ["Monat", "Mitarbeiter", "Schichten", "Stunden", "davon noch zu prüfen (Stunden)"],
      ...list.map((r) => [label, r.name, r.shifts, hours(r.minutes), hours(r.reviewMinutes)]),
      ["", "Gesamt", list.reduce((n, r) => n + r.shifts, 0), hours(list.reduce((n, r) => n + r.minutes, 0)), hours(list.reduce((n, r) => n + r.reviewMinutes, 0))],
    ];
  }

  // BOM, damit Excel Umlaute richtig anzeigt.
  const content = "﻿" + rows.map((r) => r.map(cell).join(";")).join("\r\n");
  return new Response(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="Stunden_${label}${detail ? "_Schichten" : ""}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

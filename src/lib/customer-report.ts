import { escapeHtml, formatDate } from "@/lib/time-entry";

type ReportInput = {
  propertyName: string;
  startedAt: Date;
  /** Nur erledigte Punkte, in Checklisten-Reihenfolge. */
  doneItems: { section: string; text: string }[];
};

/**
 * Kundenbericht: nur der Einsatztag und die erledigten Leistungen.
 * Bewusst ohne Uhrzeiten, Fotos, Preise, Mitarbeiternamen, Notizen und interne Hinweise.
 */
export function buildCustomerReport({ propertyName, startedAt, doneItems }: ReportInput) {
  const date = formatDate(startedAt);
  const subject = `Reinigungsbericht ${propertyName} – ${date}`;

  const sections = Array.from(new Set(doneItems.map((i) => i.section)));
  const intro = [
    "Guten Tag,",
    "",
    `Ihr Objekt „${propertyName}“ wurde am ${date} gereinigt.`,
    "",
  ];
  const services =
    doneItems.length > 0
      ? [
          "Erledigte Leistungen:",
          ...sections.flatMap((s) => [
            "",
            s,
            ...doneItems.filter((i) => i.section === s).map((i) => `- ${i.text}`),
          ]),
        ]
      : ["Die Reinigung wurde wie vereinbart durchgeführt."];
  const outro = ["", "Mit freundlichen Grüßen", "Ihr Lucid* Team"];

  const text = [...intro, ...services, ...outro].join("\n");

  const htmlServices =
    doneItems.length > 0
      ? `<p style="margin:16px 0 4px"><strong>Erledigte Leistungen</strong></p>${sections
          .map(
            (s) =>
              `<p style="margin:12px 0 2px;color:#9a7a45">${escapeHtml(s)}</p><ul style="margin:0;padding-left:18px">${doneItems
                .filter((i) => i.section === s)
                .map((i) => `<li>${escapeHtml(i.text)}</li>`)
                .join("")}</ul>`
          )
          .join("")}`
      : "<p>Die Reinigung wurde wie vereinbart durchgeführt.</p>";
  const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#141414">
<p>Guten Tag,</p>
<p>Ihr Objekt „${escapeHtml(propertyName)}“ wurde am ${date} gereinigt.</p>
${htmlServices}
<p style="margin-top:24px">Mit freundlichen Grüßen<br>Ihr Lucid* Team</p>
</div>`;

  return { subject, text, html };
}

import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { WorkLogDocument } from "@/lib/pdf/work-log-document";

export const runtime = "nodejs";

const WEEKDAY_NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const STATUS_LABELS: Record<string, string> = {
  OFFEN: "Offen",
  ABGESCHLOSSEN: "Erledigt",
};

function formatDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workLogId = searchParams.get("workLogId");

  if (!workLogId) {
    return new Response("workLogId required", { status: 400 });
  }

  const workLog = await prisma.workLog.findUnique({
    where: { id: workLogId },
    include: {
      template: true,
      site: true,
      entries: {
        orderBy: { sortOrder: "asc" },
        include: { employee: true },
      },
    },
  });

  if (!workLog) {
    return new Response("Not found", { status: 404 });
  }

  const areaMap = new Map<string, { itemLabel: string; checked: boolean; employeeName?: string | null }[]>();
  for (const entry of workLog.entries) {
    const list = areaMap.get(entry.areaName) ?? [];
    list.push({
      itemLabel: entry.itemLabel,
      checked: entry.checked,
      employeeName: entry.employee ? `${entry.employee.firstName} ${entry.employee.lastName}` : null,
    });
    areaMap.set(entry.areaName, list);
  }
  const areas = Array.from(areaMap.entries()).map(([name, entries]) => ({ name, entries }));

  const siteName = workLog.site?.name ?? workLog.template.name;

  const buffer = await renderToBuffer(
    WorkLogDocument({
      siteName,
      templateName: workLog.template.name,
      date: formatDate(workLog.date),
      dayName: WEEKDAY_NAMES[workLog.date.getDay()],
      status: STATUS_LABELS[workLog.status] ?? workLog.status,
      notes: workLog.notes,
      areas,
    })
  );

  const safeName = `${siteName}_${formatDate(workLog.date)}`.replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, "").replace(/\s+/g, "_");

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Arbeitsprotokoll_${safeName}.pdf"`,
    },
  });
}

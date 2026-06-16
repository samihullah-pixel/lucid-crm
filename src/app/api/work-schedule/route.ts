import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getOccurrencesInMonth } from "@/lib/recurrence";
import { WorkScheduleDocument, type ScheduleDay } from "@/lib/pdf/work-schedule-document";

export const runtime = "nodejs";

const monthNames = [
  "Januar", "Februar", "Maerz", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

const weekdayNames = [
  "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId");
  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));

  if (!employeeId || !month || !year) {
    return new Response("employeeId, month und year sind erforderlich", { status: 400 });
  }

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) {
    return new Response("Mitarbeiter nicht gefunden", { status: 404 });
  }

  const appointments = await prisma.appointment.findMany({
    where: { employeeId, status: "AKTIV" },
  });

  const daysInMonth = new Date(year, month, 0).getDate();
  const workDaySet = new Set<number>();

  for (const appt of appointments) {
    const occurrences = getOccurrencesInMonth(
      {
        intervalType: appt.intervalType,
        weekdays: appt.weekdays,
        date: appt.date,
        startDate: appt.startDate,
      },
      year,
      month
    );
    for (const d of occurrences) {
      workDaySet.add(d.getDate());
    }
  }

  const days: ScheduleDay[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const isoWeekday = date.getDay() === 0 ? 7 : date.getDay();
    days.push({
      date,
      weekday: weekdayNames[isoWeekday - 1],
      status: workDaySet.has(day) ? "Arbeit" : "Frei",
    });
  }

  const buffer = await renderToBuffer(
    WorkScheduleDocument({
      employeeName: `${employee.firstName} ${employee.lastName}`,
      monthName: monthNames[month - 1],
      year,
      days,
    })
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Arbeitsplan-${employee.lastName}-${month}-${year}.pdf"`,
    },
  });
}

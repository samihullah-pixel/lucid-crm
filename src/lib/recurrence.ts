type IntervalType =
  | "EINMALIG"
  | "TAEGLICH"
  | "WOECHENTLICH"
  | "ZWEIWOECHENTLICH"
  | "MONATLICH"
  | "NACH_BEDARF";

export type RecurrenceInput = {
  intervalType: IntervalType;
  weekdays: number[];
  date: Date | null;
  startDate: Date | null;
};

function isoWeekday(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function sameMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month - 1;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getOccurrencesInMonth(
  appt: RecurrenceInput,
  year: number,
  month: number
): Date[] {
  const days = daysInMonth(year, month);
  const occurrences: Date[] = [];

  if (appt.intervalType === "NACH_BEDARF") {
    return [];
  }

  if (appt.intervalType === "EINMALIG") {
    if (appt.date && sameMonth(appt.date, year, month)) {
      occurrences.push(startOfDay(appt.date));
    }
    return occurrences;
  }

  const anchor = appt.startDate ? startOfDay(appt.startDate) : null;

  for (let day = 1; day <= days; day++) {
    const candidate = new Date(year, month - 1, day);
    if (anchor && candidate < anchor) continue;

    if (appt.intervalType === "TAEGLICH") {
      occurrences.push(candidate);
      continue;
    }

    if (appt.intervalType === "WOECHENTLICH") {
      if (appt.weekdays.includes(isoWeekday(candidate))) {
        occurrences.push(candidate);
      }
      continue;
    }

    if (appt.intervalType === "ZWEIWOECHENTLICH") {
      if (!appt.weekdays.includes(isoWeekday(candidate))) continue;
      if (!anchor) {
        occurrences.push(candidate);
        continue;
      }
      const msPerDay = 24 * 60 * 60 * 1000;
      const anchorWeekStart = new Date(anchor);
      anchorWeekStart.setDate(anchor.getDate() - (isoWeekday(anchor) - 1));
      const candidateWeekStart = new Date(candidate);
      candidateWeekStart.setDate(candidate.getDate() - (isoWeekday(candidate) - 1));
      const weeksSince = Math.round(
        (candidateWeekStart.getTime() - anchorWeekStart.getTime()) / (7 * msPerDay)
      );
      if (weeksSince >= 0 && weeksSince % 2 === 0) {
        occurrences.push(candidate);
      }
      continue;
    }

    if (appt.intervalType === "MONATLICH") {
      const targetDay = anchor ? Math.min(anchor.getDate(), days) : Math.min(1, days);
      if (day === targetDay) {
        occurrences.push(candidate);
      }
      continue;
    }
  }

  return occurrences;
}

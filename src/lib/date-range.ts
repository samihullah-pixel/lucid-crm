export function getWeekRange(date: Date): { start: Date; end: Date } {
  const isoWeekday = date.getDay() === 0 ? 7 : date.getDay();
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (isoWeekday - 1));
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

export function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toDateParam(date: Date): string {
  return date.toISOString().slice(0, 10);
}

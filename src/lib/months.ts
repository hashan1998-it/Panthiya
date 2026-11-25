export const MONTH_COUNT = 12;

export function isMonth(month: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

export function listRecentMonths(today: string, count: number = MONTH_COUNT): string[] {
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7)) - 1;

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(year, month - index, 1));
    return date.toISOString().slice(0, 7);
  });
}

export function pickMonth(value: string | undefined, today: string): string {
  return value && listRecentMonths(today).includes(value) ? value : today.slice(0, 7);
}

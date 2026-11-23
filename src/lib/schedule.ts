export const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6] as const;

const FIRST_SUNDAY_OF_2026 = Date.UTC(2026, 0, 4);
const DAY_MS = 24 * 60 * 60 * 1000;

export function formatWeekday(dayOfWeek: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }).format(
    FIRST_SUNDAY_OF_2026 + dayOfWeek * DAY_MS,
  );
}

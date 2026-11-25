import { getFormatter, getLocale } from "next-intl/server";
import { DAYS_OF_WEEK, formatWeekday } from "./schedule";

export type Option = { value: string; label: string };

export type WeekdayName = { long: string; short: string };

export async function getMonthOptions(months: readonly string[]): Promise<Option[]> {
  const format = await getFormatter();

  return months.map((value) => ({
    value,
    label: format.dateTime(new Date(`${value}-01T00:00:00Z`), {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
  }));
}

export async function getWeekdayNames(): Promise<WeekdayName[]> {
  const locale = await getLocale();

  return DAYS_OF_WEEK.map((day) => ({
    long: formatWeekday(day, locale),
    short: formatWeekday(day, locale, "short"),
  }));
}

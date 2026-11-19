// The server runs in UTC (Vercel), but "today" and "this month" must follow Sri Lanka time.
export const TIME_ZONE = "Asia/Colombo";

const colomboDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getColomboDateParts(now: Date) {
  const parts = colomboDateFormatter.formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return { year: get("year"), month: get("month"), day: get("day") };
}

/** Today's date in Sri Lanka, as "YYYY-MM-DD". */
export function getToday(now: Date = new Date()): string {
  const { year, month, day } = getColomboDateParts(now);
  return `${year}-${month}-${day}`;
}

/** The current month in Sri Lanka, as "YYYY-MM". */
export function getCurrentMonth(now: Date = new Date()): string {
  const { year, month } = getColomboDateParts(now);
  return `${year}-${month}`;
}

import { z } from "zod";

export const SESSION_DATE_COUNT = 12;

const DAY_MS = 24 * 60 * 60 * 1000;

function toTime(date: string) {
  return Date.parse(`${date}T00:00:00Z`);
}

function toDate(time: number) {
  return new Date(time).toISOString().slice(0, 10);
}

export function listSessionDates(
  dayOfWeek: number,
  today: string,
  count: number = SESSION_DATE_COUNT,
): string[] {
  const todayTime = toTime(today);
  const daysSinceSession = (new Date(todayTime).getUTCDay() - dayOfWeek + 7) % 7;
  const latest = todayTime - daysSinceSession * DAY_MS;

  return Array.from({ length: count }, (_, week) => toDate(latest - week * 7 * DAY_MS));
}

export function isSessionDate(date: string, dayOfWeek: number, today: string): boolean {
  if (!z.iso.date().safeParse(date).success) return false;

  return date <= today && new Date(toTime(date)).getUTCDay() === dayOfWeek;
}

import { toMinutes } from "@/features/timetable/layout";
import { getDayOfWeek } from "@/lib/dates";

export type ScheduledClass = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

export function findNextClass<T extends ScheduledClass>(
  classes: readonly T[],
  today: string,
  time: string,
): { klass: T; date: string } | null {
  const now = toMinutes(time);
  const todayDay = getDayOfWeek(today);

  for (let offset = 0; offset < 8; offset += 1) {
    const day = (todayDay + offset) % 7;
    const [next] = classes
      .filter(
        (klass) => klass.day_of_week === day && (offset > 0 || toMinutes(klass.end_time) > now),
      )
      .sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));

    if (next) return { klass: next, date: addDays(today, offset) };
  }

  return null;
}

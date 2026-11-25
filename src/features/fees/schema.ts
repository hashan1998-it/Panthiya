import type { Messages } from "next-intl";
import { z } from "zod";
import { listRecentMonths } from "@/lib/months";

export type FeesErrorKey = keyof Messages["fees"]["errors"];
const error = (key: FeesErrorKey) => ({ error: key });

function toMonth(year: number, monthIndex: number): string {
  return new Date(Date.UTC(year, monthIndex, 1)).toISOString().slice(0, 7);
}

export function listDueMonths(today: string): string[] {
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));

  return [toMonth(year, month), ...listRecentMonths(today)];
}

export function pickDueMonth(value: string | undefined, today: string): string {
  return value && listDueMonths(today).includes(value) ? value : today.slice(0, 7);
}

export function getMonthBounds(month: string): { first: string; last: string } {
  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7)) - 1;
  const last = new Date(Date.UTC(year, monthIndex + 1, 0)).toISOString().slice(0, 10);

  return { first: `${month}-01`, last };
}

export function generateDuesSchema(today: string) {
  const months = listDueMonths(today);

  return z.object({
    month: z.string().refine((month) => months.includes(month), error("invalidMonth")),
  });
}

export type GenerateDuesValues = z.input<ReturnType<typeof generateDuesSchema>>;

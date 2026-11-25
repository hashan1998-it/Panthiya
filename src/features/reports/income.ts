import { listRecentMonths } from "@/lib/months";

export const INCOME_MONTH_COUNT = 6;

export type MonthlyIncome = {
  month: string;
  collected: number;
};

export function fillIncomeMonths(
  today: string,
  rows: readonly { month: string | null; collected: number | null }[],
  count: number = INCOME_MONTH_COUNT,
): MonthlyIncome[] {
  const collectedByMonth = new Map(
    rows.flatMap((row) => (row.month ? [[row.month.slice(0, 7), row.collected ?? 0]] : [])),
  );

  return listRecentMonths(today, count)
    .reverse()
    .map((month) => ({ month, collected: collectedByMonth.get(month) ?? 0 }));
}

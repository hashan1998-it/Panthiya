import { createClient } from "@/lib/supabase/server";
import { getMonthBounds } from "./schema";

export type DuesSummary = {
  count: number;
  totalDue: number;
  freeCount: number;
};

export async function getDuesSummary(month: string): Promise<DuesSummary> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dues")
    .select("amount_due")
    .eq("month", getMonthBounds(month).first);

  if (error) throw error;

  const totalCents = data.reduce((sum, due) => sum + Math.round(due.amount_due * 100), 0);

  return {
    count: data.length,
    totalDue: totalCents / 100,
    freeCount: data.filter((due) => due.amount_due === 0).length,
  };
}

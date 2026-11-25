import { cache } from "react";
import { getDayOfWeek } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type TodayClass = Pick<
  Tables<"classes">,
  "id" | "subject" | "grade" | "start_time" | "end_time"
> & {
  enrolled_count: number;
};

export async function countActiveStudents(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  if (error) throw error;
  return count ?? 0;
}

export const listClassesOn = cache(async (date: string): Promise<TodayClass[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select("id, subject, grade, start_time, end_time, enrollments(count)")
    .eq("is_active", true)
    .eq("day_of_week", getDayOfWeek(date))
    .is("enrollments.ended_on", null)
    .order("start_time")
    .order("subject");

  if (error) throw error;

  return data.map(({ enrollments, ...klass }) => ({
    ...klass,
    enrolled_count: enrollments[0]?.count ?? 0,
  }));
});

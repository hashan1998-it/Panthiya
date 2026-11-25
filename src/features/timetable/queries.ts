import { createClient } from "@/lib/supabase/server";
import type { TimetableClass } from "./layout";

export async function listTimetableClasses(): Promise<TimetableClass[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select("id, subject, grade, day_of_week, start_time, end_time")
    .eq("is_active", true)
    .order("day_of_week")
    .order("start_time");

  if (error) throw error;
  return data;
}

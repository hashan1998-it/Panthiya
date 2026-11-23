import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type ClassListItem = Pick<
  Tables<"classes">,
  "id" | "subject" | "grade" | "day_of_week" | "start_time" | "end_time" | "monthly_fee"
> & {
  enrolled_count: number;
};

const LIST_COLUMNS =
  "id, subject, grade, day_of_week, start_time, end_time, monthly_fee, enrollments(count)";

export async function listClasses(): Promise<ClassListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select(LIST_COLUMNS)
    .is("enrollments.ended_on", null)
    .order("day_of_week")
    .order("start_time")
    .order("subject");

  if (error) throw error;

  return data.map(({ enrollments, ...klass }) => ({
    ...klass,
    enrolled_count: enrollments[0]?.count ?? 0,
  }));
}

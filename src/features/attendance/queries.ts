import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import type { AttendanceStatus } from "./summary";

export type AttendanceClass = Pick<
  Tables<"classes">,
  "id" | "subject" | "grade" | "day_of_week" | "start_time"
>;

export type RosterStudent = Pick<Tables<"students">, "id" | "admission_no" | "full_name"> & {
  status: AttendanceStatus | null;
};

const STUDENT_COLUMNS = "student:students(id, admission_no, full_name, is_active)";

export async function listAttendanceClasses(): Promise<AttendanceClass[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select("id, subject, grade, day_of_week, start_time")
    .eq("is_active", true)
    .order("day_of_week")
    .order("start_time")
    .order("subject");

  if (error) throw error;
  return data;
}

export async function getAttendanceRoster(
  classId: string,
  sessionDate: string,
): Promise<RosterStudent[]> {
  if (!z.iso.date().safeParse(sessionDate).success) return [];

  const supabase = await createClient();
  const [enrolled, marked] = await Promise.all([
    supabase
      .from("enrollments")
      .select(STUDENT_COLUMNS)
      .eq("class_id", classId)
      .lte("enrolled_on", sessionDate)
      .or(`ended_on.is.null,ended_on.gte.${sessionDate}`),
    supabase
      .from("attendance")
      .select(`status, ${STUDENT_COLUMNS}`)
      .eq("class_id", classId)
      .eq("session_date", sessionDate),
  ]);

  if (enrolled.error) throw enrolled.error;
  if (marked.error) throw marked.error;

  const roster = new Map<string, RosterStudent>();
  for (const { student } of [...enrolled.data, ...marked.data]) {
    if (!student.is_active) continue;
    roster.set(student.id, {
      id: student.id,
      admission_no: student.admission_no,
      full_name: student.full_name,
      status: null,
    });
  }
  for (const { student, status } of marked.data) {
    const entry = roster.get(student.id);
    if (entry) entry.status = status;
  }

  return [...roster.values()].sort((a, b) => a.full_name.localeCompare(b.full_name));
}

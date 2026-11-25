import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import { isMonth } from "./session-dates";
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

export type MonthAttendanceRow = Pick<
  Tables<"students">,
  "id" | "admission_no" | "full_name" | "is_active"
> & {
  marks: Record<string, AttendanceStatus>;
};

export type StudentMonthMark = Pick<Tables<"attendance">, "class_id" | "session_date" | "status">;

function monthBounds(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const last = new Date(Date.UTC(year, monthIndex, 0)).toISOString().slice(0, 10);
  return { first: `${month}-01`, last };
}

export async function getClassMonthAttendance(
  classId: string,
  month: string,
): Promise<MonthAttendanceRow[]> {
  if (!isMonth(month)) return [];

  const { first, last } = monthBounds(month);
  const supabase = await createClient();
  const [enrolled, marked] = await Promise.all([
    supabase
      .from("enrollments")
      .select(STUDENT_COLUMNS)
      .eq("class_id", classId)
      .lte("enrolled_on", last)
      .or(`ended_on.is.null,ended_on.gte.${first}`),
    supabase
      .from("attendance")
      .select(`session_date, status, ${STUDENT_COLUMNS}`)
      .eq("class_id", classId)
      .gte("session_date", first)
      .lte("session_date", last),
  ]);

  if (enrolled.error) throw enrolled.error;
  if (marked.error) throw marked.error;

  const rows = new Map<string, MonthAttendanceRow>();
  const rowFor = (student: (typeof marked.data)[number]["student"]) => {
    let row = rows.get(student.id);
    if (!row) {
      row = {
        id: student.id,
        admission_no: student.admission_no,
        full_name: student.full_name,
        is_active: student.is_active,
        marks: {},
      };
      rows.set(student.id, row);
    }
    return row;
  };

  for (const { student } of enrolled.data) {
    if (student.is_active) rowFor(student);
  }
  for (const { student, session_date, status } of marked.data) {
    rowFor(student).marks[session_date] = status;
  }

  return [...rows.values()].sort((a, b) => a.full_name.localeCompare(b.full_name));
}

export async function getStudentMonthAttendance(
  studentId: string,
  month: string,
): Promise<StudentMonthMark[]> {
  if (!isMonth(month)) return [];

  const { first, last } = monthBounds(month);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attendance")
    .select("class_id, session_date, status")
    .eq("student_id", studentId)
    .gte("session_date", first)
    .lte("session_date", last);

  if (error) throw error;
  return data;
}

"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { getToday } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import { getAttendanceRoster } from "./queries";
import { attendanceSchema, type AttendanceErrorKey, type AttendanceValues } from "./schema";
import { isSessionDate } from "./session-dates";

const ERROR_KEYS = [
  "noMarks",
  "invalidDate",
  "notFound",
  "saveFailed",
] as const satisfies readonly AttendanceErrorKey[];

export type SaveAttendanceResult =
  { ok: true; count: number } | { ok: false; error: AttendanceErrorKey };

export async function saveAttendance(values: AttendanceValues): Promise<SaveAttendanceResult> {
  await requireRole("admin");

  const result = attendanceSchema.safeParse(values);
  if (!result.success) {
    const message = result.error.issues[0].message;
    const error = ERROR_KEYS.find((key) => key === message) ?? "saveFailed";
    return { ok: false, error };
  }
  const { class_id, session_date, marks } = result.data;

  const supabase = await createClient();
  const { data: klass, error: classError } = await supabase
    .from("classes")
    .select("day_of_week")
    .eq("id", class_id)
    .eq("is_active", true)
    .maybeSingle();

  if (classError) return { ok: false, error: "saveFailed" };
  if (!klass) return { ok: false, error: "notFound" };
  if (!isSessionDate(session_date, klass.day_of_week, getToday())) {
    return { ok: false, error: "invalidDate" };
  }

  const roster = await getAttendanceRoster(class_id, session_date);
  const rosterIds = new Set(roster.map((student) => student.id));
  if (!marks.every((mark) => rosterIds.has(mark.student_id))) {
    return { ok: false, error: "saveFailed" };
  }

  const { error } = await supabase.from("attendance").upsert(
    marks.map((mark) => ({ ...mark, class_id, session_date })),
    { onConflict: "class_id,student_id,session_date" },
  );

  if (error) return { ok: false, error: "saveFailed" };

  revalidatePath("/attendance");
  for (const mark of marks) {
    revalidatePath(`/students/${mark.student_id}`);
  }

  return { ok: true, count: marks.length };
}

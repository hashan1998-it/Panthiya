"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/require-role";
import { getToday } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import { enrollSchema, type EnrollErrorKey, type EnrollFormValues } from "./enrollment-schema";

export type EnrollResult = { ok: true; count: number } | { ok: false; error: EnrollErrorKey };

export type UnenrollResult = { ok: true; fullName: string } | { ok: false };

const isId = (id: string) => z.guid().safeParse(id).success;

function revalidateEnrollment(classId: string, studentIds: string[]) {
  revalidatePath("/classes");
  revalidatePath(`/classes/${classId}`);
  for (const studentId of studentIds) {
    revalidatePath(`/students/${studentId}`);
  }
}

export async function enrollStudents(
  classId: string,
  values: EnrollFormValues,
): Promise<EnrollResult> {
  await requireRole("admin");

  if (!isId(classId)) return { ok: false, error: "notFound" };

  const result = enrollSchema.safeParse(values);
  if (!result.success) return { ok: false, error: "saveFailed" };

  const studentIds = result.data.enrollments.map((enrollment) => enrollment.student_id);
  const supabase = await createClient();

  const [klass, students, active] = await Promise.all([
    supabase.from("classes").select("id").eq("id", classId).maybeSingle(),
    supabase.from("students").select("id").in("id", studentIds).eq("is_active", true),
    supabase
      .from("enrollments")
      .select("student_id")
      .eq("class_id", classId)
      .in("student_id", studentIds)
      .is("ended_on", null),
  ]);

  if (klass.error || students.error || active.error) return { ok: false, error: "saveFailed" };
  if (!klass.data) return { ok: false, error: "notFound" };

  const activeStudentIds = new Set(students.data.map((student) => student.id));
  const alreadyEnrolled = new Set(active.data.map((enrollment) => enrollment.student_id));
  const today = getToday();

  const rows = result.data.enrollments
    .filter(
      ({ student_id }) => activeStudentIds.has(student_id) && !alreadyEnrolled.has(student_id),
    )
    .map((enrollment) => ({
      ...enrollment,
      class_id: classId,
      enrolled_on: today,
      ended_on: null,
    }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from("enrollments")
      .upsert(rows, { onConflict: "student_id,class_id" });

    if (error) return { ok: false, error: "saveFailed" };
  }

  revalidateEnrollment(
    classId,
    rows.map((row) => row.student_id),
  );

  return { ok: true, count: rows.length };
}

export async function unenrollStudent(enrollmentId: string): Promise<UnenrollResult> {
  await requireRole("admin");

  if (!isId(enrollmentId)) return { ok: false };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .update({ ended_on: getToday() })
    .eq("id", enrollmentId)
    .is("ended_on", null)
    .select("class_id, student:students(id, full_name)")
    .maybeSingle();

  if (error || !data) return { ok: false };

  revalidateEnrollment(data.class_id, [data.student.id]);

  return { ok: true, fullName: data.student.full_name };
}

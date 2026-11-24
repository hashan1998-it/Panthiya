import { cache } from "react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type ClassListItem = Pick<
  Tables<"classes">,
  "id" | "subject" | "grade" | "day_of_week" | "start_time" | "end_time" | "monthly_fee"
> & {
  enrolled_count: number;
};

export type ClassDetail = Omit<Tables<"classes">, "created_at">;

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

const DETAIL_COLUMNS =
  "id, subject, grade, day_of_week, start_time, end_time, monthly_fee, is_active";

export const getClass = cache(async (id: string): Promise<ClassDetail | null> => {
  if (!z.guid().safeParse(id).success) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select(DETAIL_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data;
});

const ENROLLMENT_COLUMNS =
  "id, discount_type, discount_percent, enrolled_on, student:students(id, admission_no, full_name, is_active)";

export async function getClassEnrollments(classId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select(ENROLLMENT_COLUMNS)
    .eq("class_id", classId)
    .is("ended_on", null);

  if (error) throw error;

  return data.toSorted((a, b) => a.student.full_name.localeCompare(b.student.full_name));
}

export type ClassEnrollment = Awaited<ReturnType<typeof getClassEnrollments>>[number];

export type EnrollableStudent = Pick<
  Tables<"students">,
  "id" | "admission_no" | "full_name" | "grade"
>;

export async function getEnrollableStudents(classId: string): Promise<EnrollableStudent[]> {
  const supabase = await createClient();
  const [students, enrolled] = await Promise.all([
    supabase
      .from("students")
      .select("id, admission_no, full_name, grade")
      .eq("is_active", true)
      .order("full_name"),
    supabase.from("enrollments").select("student_id").eq("class_id", classId).is("ended_on", null),
  ]);

  if (students.error) throw students.error;
  if (enrolled.error) throw enrolled.error;

  const enrolledIds = new Set(enrolled.data.map((enrollment) => enrollment.student_id));
  return students.data.filter((student) => !enrolledIds.has(student.id));
}

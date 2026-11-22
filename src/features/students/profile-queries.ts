import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getStudentEnrollments = cache(async (studentId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select(
      "id, discount_type, discount_percent, enrolled_on, ended_on, class:classes(id, subject, grade, day_of_week, start_time, end_time, monthly_fee)",
    )
    .eq("student_id", studentId)
    .order("enrolled_on", { ascending: false });

  if (error) throw error;
  return data;
});

export const getStudentAttendance = cache(async (studentId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attendance")
    .select("class_id, status")
    .eq("student_id", studentId);

  if (error) throw error;
  return data;
});

export const getStudentPayments = cache(async (studentId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select(
      "id, amount, paid_on, method, receipt_no, voided_at, due:dues!inner(month, enrollment:enrollments!inner(student_id, class:classes(subject, grade)))",
    )
    .eq("due.enrollment.student_id", studentId)
    .order("paid_on", { ascending: false })
    .order("receipt_no", { ascending: false });

  if (error) throw error;
  return data;
});

export type StudentEnrollment = Awaited<ReturnType<typeof getStudentEnrollments>>[number];
export type StudentAttendanceRow = Awaited<ReturnType<typeof getStudentAttendance>>[number];
export type StudentPayment = Awaited<ReturnType<typeof getStudentPayments>>[number];

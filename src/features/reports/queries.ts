import { createClient } from "@/lib/supabase/server";
import { listRecentMonths } from "@/lib/months";
import { fillIncomeMonths, INCOME_MONTH_COUNT, type MonthlyIncome } from "./income";

export type ClassAttendanceRate = {
  classId: string;
  subject: string;
  grade: number;
  marked: number;
  rate: number | null;
};

export type ClassEnrollmentCount = {
  classId: string;
  subject: string;
  grade: number;
  students: number;
};

export async function getMonthlyIncome(today: string): Promise<MonthlyIncome[]> {
  const oldest = listRecentMonths(today, INCOME_MONTH_COUNT).at(-1);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("monthly_income")
    .select("month, collected")
    .gte("month", `${oldest}-01`);

  if (error) throw error;
  return fillIncomeMonths(today, data);
}

export async function listClassAttendanceRates(): Promise<ClassAttendanceRate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("class_attendance_rates")
    .select("class_id, subject, grade, marked, rate")
    .eq("is_active", true)
    .order("subject")
    .order("grade");

  if (error) throw error;

  return data.flatMap((row) =>
    row.class_id && row.subject && row.grade !== null
      ? [
          {
            classId: row.class_id,
            subject: row.subject,
            grade: row.grade,
            marked: row.marked ?? 0,
            rate: row.rate,
          },
        ]
      : [],
  );
}

export async function listClassEnrollmentCounts(): Promise<ClassEnrollmentCount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select("id, subject, grade, enrollments(count)")
    .eq("is_active", true)
    .is("enrollments.ended_on", null)
    .order("subject")
    .order("grade");

  if (error) throw error;

  return data.map((klass) => ({
    classId: klass.id,
    subject: klass.subject,
    grade: klass.grade,
    students: klass.enrollments[0]?.count ?? 0,
  }));
}

import { cache } from "react";
import { notFound } from "next/navigation";
import { getMonthBounds } from "@/features/fees/schema";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type PortalStudent = Pick<Tables<"students">, "id" | "admission_no" | "full_name" | "grade">;

export type UnpaidDue = {
  id: string;
  month: string;
  subject: string;
  grade: number;
  balance: number;
};

export const getMyStudent = cache(async (): Promise<PortalStudent> => {
  const profile = await getCurrentProfile();
  if (!profile) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, admission_no, full_name, grade")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) notFound();
  return data;
});

export async function listMyUnpaidDues(studentId: string, today: string): Promise<UnpaidDue[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("due_balances")
    .select("id, month, subject, grade, balance")
    .eq("student_id", studentId)
    .gt("balance", 0)
    .lte("month", getMonthBounds(today.slice(0, 7)).first)
    .order("month")
    .order("subject");

  if (error) throw error;
  return data.map((due) => ({ ...due, month: due.month.slice(0, 7), balance: due.balance ?? 0 }));
}

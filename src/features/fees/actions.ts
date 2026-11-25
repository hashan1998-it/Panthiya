"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { getToday } from "@/lib/dates";
import { calculateAmountDue } from "@/lib/fees";
import { createClient } from "@/lib/supabase/server";
import {
  generateDuesSchema,
  getMonthBounds,
  type FeesErrorKey,
  type GenerateDuesValues,
} from "./schema";

export type GenerateDuesResult =
  { ok: true; created: number; total: number } | { ok: false; error: FeesErrorKey };

export async function generateDues(values: GenerateDuesValues): Promise<GenerateDuesResult> {
  await requireRole("admin");

  const result = generateDuesSchema(getToday()).safeParse(values);
  if (!result.success) return { ok: false, error: "invalidMonth" };
  const { first, last } = getMonthBounds(result.data.month);

  const supabase = await createClient();
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("id, discount_percent, class:classes!inner(monthly_fee), student:students!inner(id)")
    .is("ended_on", null)
    .lte("enrolled_on", last)
    .eq("class.is_active", true)
    .eq("student.is_active", true);

  if (enrollmentsError) return { ok: false, error: "generateFailed" };
  if (enrollments.length === 0) return { ok: true, created: 0, total: 0 };

  const { data: created, error } = await supabase
    .from("dues")
    .upsert(
      enrollments.map((enrollment) => ({
        enrollment_id: enrollment.id,
        month: first,
        amount_due: calculateAmountDue(enrollment.class.monthly_fee, enrollment.discount_percent),
      })),
      { onConflict: "enrollment_id,month", ignoreDuplicates: true },
    )
    .select("id");

  if (error) return { ok: false, error: "generateFailed" };

  revalidatePath("/fees");

  return { ok: true, created: created.length, total: enrollments.length };
}

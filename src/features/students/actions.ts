"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { studentSchema, type StudentFormErrorKey, type StudentFormValues } from "./schema";

const UNIQUE_VIOLATION = "23505";
const ADMISSION_NO_CONSTRAINT = "students_admission_no_key";

type StudentFieldErrors = Partial<Record<keyof StudentFormValues, string[]>>;

export type CreateStudentResult =
  | { ok: true; id: string; fullName: string }
  | { ok: false; error?: StudentFormErrorKey; fieldErrors: StudentFieldErrors };

export async function createStudent(values: StudentFormValues): Promise<CreateStudentResult> {
  await requireRole("admin");

  const result = studentSchema.safeParse(values);
  if (!result.success) {
    return { ok: false, fieldErrors: z.flattenError(result.error).fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .insert(result.data)
    .select("id, full_name")
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION && error.message.includes(ADMISSION_NO_CONSTRAINT)) {
      return { ok: false, fieldErrors: { admission_no: ["admissionNoTaken"] } };
    }
    return { ok: false, error: "saveFailed", fieldErrors: {} };
  }

  revalidatePath("/students");

  return { ok: true, id: data.id, fullName: data.full_name };
}

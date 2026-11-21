"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PostgrestError } from "@supabase/supabase-js";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { studentSchema, type StudentFormErrorKey, type StudentFormValues } from "./schema";

const UNIQUE_VIOLATION = "23505";
const ADMISSION_NO_CONSTRAINT = "students_admission_no_key";

type StudentFieldErrors = Partial<Record<keyof StudentFormValues, string[]>>;

type StudentFormFailure = {
  ok: false;
  error?: StudentFormErrorKey;
  fieldErrors: StudentFieldErrors;
};

export type StudentFormResult = { ok: true; id: string; fullName: string } | StudentFormFailure;

export type StudentStatusResult = { ok: true; fullName: string } | { ok: false };

const isStudentId = (id: string) => z.guid().safeParse(id).success;

function toFailure(error: PostgrestError): StudentFormFailure {
  if (error.code === UNIQUE_VIOLATION && error.message.includes(ADMISSION_NO_CONSTRAINT)) {
    return { ok: false, fieldErrors: { admission_no: ["admissionNoTaken"] } };
  }
  return { ok: false, error: "saveFailed", fieldErrors: {} };
}

function revalidateStudent(id: string) {
  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
}

export async function createStudent(values: StudentFormValues): Promise<StudentFormResult> {
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

  if (error) return toFailure(error);

  revalidatePath("/students");

  return { ok: true, id: data.id, fullName: data.full_name };
}

export async function updateStudent(
  id: string,
  values: StudentFormValues,
): Promise<StudentFormResult> {
  await requireRole("admin");

  if (!isStudentId(id)) return { ok: false, error: "notFound", fieldErrors: {} };

  const result = studentSchema.safeParse(values);
  if (!result.success) {
    return { ok: false, fieldErrors: z.flattenError(result.error).fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .update(result.data)
    .eq("id", id)
    .select("id, full_name")
    .maybeSingle();

  if (error) return toFailure(error);
  if (!data) return { ok: false, error: "notFound", fieldErrors: {} };

  revalidateStudent(id);

  return { ok: true, id: data.id, fullName: data.full_name };
}

export async function setStudentActive(
  id: string,
  isActive: boolean,
): Promise<StudentStatusResult> {
  await requireRole("admin");

  if (!isStudentId(id)) return { ok: false };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .update({ is_active: isActive })
    .eq("id", id)
    .select("full_name")
    .maybeSingle();

  if (error || !data) return { ok: false };

  revalidateStudent(id);

  return { ok: true, fullName: data.full_name };
}

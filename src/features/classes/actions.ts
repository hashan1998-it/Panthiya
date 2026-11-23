"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { classSchema, type ClassFormErrorKey, type ClassFormValues } from "./schema";

type ClassFormFailure = {
  ok: false;
  error?: ClassFormErrorKey;
  fieldErrors: Partial<Record<keyof ClassFormValues, string[]>>;
};

export type ClassFormResult =
  { ok: true; id: string; subject: string; grade: number } | ClassFormFailure;

const failure = (error: ClassFormErrorKey): ClassFormFailure => ({
  ok: false,
  error,
  fieldErrors: {},
});

const RESULT_COLUMNS = "id, subject, grade";

function revalidateClass(id: string) {
  revalidatePath("/classes");
  revalidatePath(`/classes/${id}`);
}

export async function createClass(values: ClassFormValues): Promise<ClassFormResult> {
  await requireRole("admin");

  const result = classSchema.safeParse(values);
  if (!result.success) {
    return { ok: false, fieldErrors: z.flattenError(result.error).fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .insert(result.data)
    .select(RESULT_COLUMNS)
    .single();

  if (error) return failure("saveFailed");

  revalidatePath("/classes");

  return { ok: true, ...data };
}

export async function updateClass(id: string, values: ClassFormValues): Promise<ClassFormResult> {
  await requireRole("admin");

  if (!z.guid().safeParse(id).success) return failure("notFound");

  const result = classSchema.safeParse(values);
  if (!result.success) {
    return { ok: false, fieldErrors: z.flattenError(result.error).fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .update(result.data)
    .eq("id", id)
    .select(RESULT_COLUMNS)
    .maybeSingle();

  if (error) return failure("saveFailed");
  if (!data) return failure("notFound");

  revalidateClass(id);

  return { ok: true, ...data };
}

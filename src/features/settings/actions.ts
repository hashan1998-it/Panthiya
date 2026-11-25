"use server";

import { createClient } from "@/lib/supabase/server";
import { changePasswordSchema, type ChangePasswordValues, type PasswordErrorKey } from "./schema";

const FIELD_ERROR_KEYS = [
  "currentRequired",
  "tooShort",
  "tooLong",
  "mismatch",
  "sameAsCurrent",
] as const satisfies readonly PasswordErrorKey[];

export type ChangePasswordResult =
  { ok: true } | { ok: false; error: PasswordErrorKey; field?: keyof ChangePasswordValues };

export async function changePassword(values: ChangePasswordValues): Promise<ChangePasswordResult> {
  const result = changePasswordSchema.safeParse(values);
  if (!result.success) {
    const issue = result.error.issues[0];
    const error = FIELD_ERROR_KEYS.find((key) => key === issue.message) ?? "saveFailed";
    return { ok: false, error, field: issue.path[0] as keyof ChangePasswordValues };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, error: "saveFailed" };

  const { error: wrongPassword } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: result.data.current,
  });
  if (wrongPassword) return { ok: false, error: "currentWrong", field: "current" };

  const { error } = await supabase.auth.updateUser({ password: result.data.next });
  if (error) return { ok: false, error: "saveFailed" };

  return { ok: true };
}

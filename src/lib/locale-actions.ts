"use server";

import { createClient } from "@/lib/supabase/server";
import { isLocale } from "./locale";
import { saveLocaleCookie } from "./locale-cookie";

export async function setLocale(value: unknown): Promise<{ ok: boolean }> {
  if (!isLocale(value)) return { ok: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { error } = await supabase.from("profiles").update({ locale: value }).eq("id", user.id);
    if (error) return { ok: false };
  }

  await saveLocaleCookie(value);
  return { ok: true };
}

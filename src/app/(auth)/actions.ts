"use server";

import z from "zod";
import type { Messages } from "next-intl";
import { redirect } from "next/navigation";
import { getHomePath } from "@/lib/auth/get-home-path";
import { getUserRole } from "@/lib/auth/get-user-role";
import { createClient } from "@/lib/supabase/server";
import { type SignInErrorKey, signInSchema } from "./schema";

type SignOutErrorKey = keyof Messages["auth"]["signOut"]["errors"];

export type SignInState = {
  error?: SignInErrorKey;
  fieldErrors: {
    email?: string[];
    password?: string[];
  };
};

export type SignOutState = {
  error?: SignOutErrorKey;
  signedOut?: boolean;
};

export async function signIn(_prevState: SignInState, formData: FormData): Promise<SignInState> {
  const raw = { email: formData.get("email"), password: formData.get("password") };
  const result = signInSchema.safeParse(raw);
  if (!result.success) {
    return { fieldErrors: z.flattenError(result.error).fieldErrors };
  }

  const { email, password } = result.data;
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (authError) {
    return { error: "invalidCredentials", fieldErrors: {} };
  }

  const role = await getUserRole(supabase, authData.user.id);
  if (!role) {
    await supabase.auth.signOut();
    return { error: "accountLoadFailed", fieldErrors: {} };
  }

  redirect(getHomePath(role));
}

export async function signOut(): Promise<SignOutState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) {
    return { error: "failed" };
  }

  return { signedOut: true };
}

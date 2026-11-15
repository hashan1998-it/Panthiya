"use server";

import z from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInSchema } from "./schema";

export type SignInState = {
  error?: string;
  fieldErrors: {
    email?: string[];
    password?: string[];
  };
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
    return { error: "Invalid email or password", fieldErrors: {} };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();
  if (profileError) {
    await supabase.auth.signOut();
    return { error: "We couldn't load your account. Please try again.", fieldErrors: {} };
  }
  redirect(profile.role === "admin" ? "/dashboard" : "/me");
}

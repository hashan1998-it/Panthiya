import { cache } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "./get-home-path";

export type CurrentProfile = {
  id: string;
  role: UserRole;
  fullName: string;
};

export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (error) return null;

  return { id: user.id, role: profile.role, fullName: profile.full_name };
});

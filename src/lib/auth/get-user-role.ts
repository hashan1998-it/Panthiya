import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { UserRole } from "./get-home-path";

export async function getUserRole(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<UserRole | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) return null;

  return profile.role;
}

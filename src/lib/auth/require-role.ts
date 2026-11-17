import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getHomePath, type UserRole } from "./get-home-path";
import { getUserRole } from "./get-user-role";

export async function requireRole(requiredRole: UserRole) {
  // Supabase checks token expiry with Date.now(), so this must run per request.
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const role = await getUserRole(supabase, user.id);

  if (!role) redirect("/login");
  if (role !== requiredRole) redirect(getHomePath(role));
}

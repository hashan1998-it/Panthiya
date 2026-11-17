import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHomePath, type UserRole } from "./getHomePath";
import { getUserRole } from "./getUserRole";

export async function requireRole(requiredRole: UserRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const role = await getUserRole(supabase, user.id);

  if (!role) redirect("/login");
  if (role !== requiredRole) redirect(getHomePath(role));
}

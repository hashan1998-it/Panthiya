import { redirect } from "next/navigation";
import { getHomePath, type UserRole } from "./get-home-path";
import { getCurrentProfile } from "./get-current-profile";

export async function requireRole(requiredRole: UserRole) {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== requiredRole) redirect(getHomePath(profile.role));

  return profile;
}

import type { Database } from "@/types/database";

export type UserRole = Database["public"]["Enums"]["user_role"];

const HOME_PATH_BY_ROLE: Record<UserRole, string> = {
  admin: "/dashboard",
  student: "/me",
};

export function getHomePath(role: UserRole) {
  return HOME_PATH_BY_ROLE[role];
}

import { Suspense, type ReactNode } from "react";
import { requireRole } from "@/lib/auth/require-role";
import type { UserRole } from "@/lib/auth/get-home-path";

type RoleGateProps = {
  role: UserRole;
  children: ReactNode;
  fallback?: ReactNode;
};

async function RoleCheck({ role, children }: Omit<RoleGateProps, "fallback">) {
  await requireRole(role);

  return children;
}

export function RoleGate({ role, children, fallback }: RoleGateProps) {
  return (
    <Suspense fallback={fallback}>
      <RoleCheck role={role}>{children}</RoleCheck>
    </Suspense>
  );
}

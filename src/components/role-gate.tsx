import { Suspense, type ReactNode } from "react";
import { requireRole } from "@/lib/auth/require-role";
import type { UserRole } from "@/lib/auth/get-home-path";

type RoleGateProps = {
  role: UserRole;
  children: ReactNode;
};

async function RoleCheck({ role, children }: RoleGateProps) {
  await requireRole(role);

  return children;
}

// The role check reads cookies, which only exist at request time. With Cache
// Components on, that work must sit inside <Suspense> so the rest of the route
// can still be prerendered.
export function RoleGate({ role, children }: RoleGateProps) {
  return (
    <Suspense>
      <RoleCheck role={role}>{children}</RoleCheck>
    </Suspense>
  );
}

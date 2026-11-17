"use client";

import { Button } from "@/components/ui/button";
import { useSignOut } from "./use-sign-out";

function SignOutButton() {
  const { formAction, busy } = useSignOut();

  return (
    <form action={formAction}>
      <Button type="submit" variant="outline" disabled={busy}>
        {busy ? "Signing out…" : "Sign out"}
      </Button>
    </form>
  );
}

export default SignOutButton;

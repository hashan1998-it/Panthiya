"use client";

import { Button } from "@/components/ui/button";
import { useSignOut } from "./use-sign-out";

function SignOutButton() {
  const { formAction, busy, error } = useSignOut();

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <Button type="submit" variant="outline" disabled={busy}>
        {busy ? "Signing out…" : "Sign out"}
      </Button>
      {error && (
        <p role="alert" className="text-body-sm text-destructive-foreground">
          {error}
        </p>
      )}
    </form>
  );
}

export default SignOutButton;

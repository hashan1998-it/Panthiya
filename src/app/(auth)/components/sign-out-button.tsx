"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { signOut, type SignOutState } from "../actions";

const initialState: SignOutState = {};

function SignOutButton() {
  const [state, signOutAction, pending] = useActionState(signOut, initialState);

  return (
    <form action={signOutAction} className="flex flex-col items-start gap-2">
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Signing out…" : "Sign out"}
      </Button>
      {state.error && (
        <p role="alert" className="text-body-sm text-destructive-foreground">
          {state.error}
        </p>
      )}
    </form>
  );
}

export default SignOutButton;

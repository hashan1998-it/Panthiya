"use client";

import { startTransition, useActionState, useEffect } from "react";
import { signOut, type SignOutState } from "../actions";

const initialState: SignOutState = {};

export function useSignOut() {
  const [state, formAction, pending] = useActionState(signOut, initialState);

  useEffect(() => {
    if (state.signedOut) {
      window.location.replace("/login");
    }
  }, [state.signedOut]);

  return {
    formAction,
    signOut: () => startTransition(formAction),
    busy: pending || Boolean(state.signedOut),
    error: state.error,
  };
}

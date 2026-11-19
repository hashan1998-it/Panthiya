"use client";

import { useTranslations } from "next-intl";
import { startTransition, useActionState, useEffect } from "react";
import { toast } from "sonner";
import { signOut, type SignOutState } from "../actions";

const initialState: SignOutState = {};

export function useSignOut() {
  const t = useTranslations("auth.signOut");
  const [state, formAction, pending] = useActionState(signOut, initialState);

  useEffect(() => {
    if (state.signedOut) {
      window.location.replace("/login");
    } else if (state.error) {
      toast.error(t(`errors.${state.error}`));
    }
  }, [state, t]);

  return {
    formAction,
    signOut: () => startTransition(formAction),
    busy: pending || Boolean(state.signedOut),
  };
}

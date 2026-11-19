"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useSignOut } from "./use-sign-out";

function SignOutButton() {
  const t = useTranslations("auth.signOut");
  const { formAction, busy } = useSignOut();

  return (
    <form action={formAction}>
      <Button type="submit" variant="outline" disabled={busy}>
        {busy ? t("signingOut") : t("signOut")}
      </Button>
    </form>
  );
}

export default SignOutButton;

import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import SignOutButton from "@/app/(auth)/components/sign-out-button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("me");

  return { title: t("metaTitle") };
}

export default function MePage() {
  const t = useTranslations();

  return (
    <main className="mx-auto w-full max-w-300 px-4 py-8 md:px-6">
      <h1 className="text-display-sm">{t("me.title")}</h1>
      <p className="text-body-sm text-muted-foreground">{t("common.comingSoon")}</p>
      <div className="mt-6">
        <SignOutButton />
      </div>
    </main>
  );
}

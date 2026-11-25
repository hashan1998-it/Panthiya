import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LanguageSwitch } from "@/components/language-switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SignInForm from "../components/sign-in-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.signIn");

  return { title: t("metaTitle") };
}

export default async function SignInPage() {
  const t = await getTranslations();

  return (
    <main className="relative flex flex-1 items-center justify-center px-4 py-12">
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <LanguageSwitch />
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm gap-6 py-8">
        <CardHeader className="gap-2 px-6 text-center">
          <CardTitle className="text-display-sm">{t("metadata.title")}</CardTitle>
          <CardDescription className="text-body-sm">{t("auth.signIn.description")}</CardDescription>
        </CardHeader>
        <CardContent className="px-6">
          <SignInForm />
        </CardContent>
      </Card>
    </main>
  );
}

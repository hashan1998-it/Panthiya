import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsSections } from "@/features/settings/components/settings-sections";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings");

  return { title: t("metaTitle") };
}

export default function MySettingsPage() {
  const t = useTranslations("settings");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("title")} description={t("description")} />
      <SettingsSections />
    </div>
  );
}

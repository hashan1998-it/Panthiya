import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");

  return { title: t("metaTitle") };
}

export default function DashboardPage() {
  const t = useTranslations();

  return <PageHeader title={t("nav.dashboard")} description={t("common.comingSoon")} />;
}

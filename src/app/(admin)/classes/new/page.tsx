import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { ClassForm } from "@/features/classes/components/class-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("classes.form");

  return { title: t("metaTitle") };
}

export default function NewClassPage() {
  const t = useTranslations("classes");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("addClass")} description={t("form.description")} />
      <ClassForm />
    </div>
  );
}

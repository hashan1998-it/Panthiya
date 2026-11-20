import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { StudentForm } from "@/features/students/components/student-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("students.form");

  return { title: t("metaTitle") };
}

export default function NewStudentPage() {
  const t = useTranslations("students");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("addStudent")} description={t("form.description")} />
      <StudentForm />
    </div>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ClassForm } from "@/features/classes/components/class-form";
import { getWeekdayNames } from "@/lib/get-date-labels";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("classes.form");

  return { title: t("metaTitle") };
}

async function NewClassForm() {
  return <ClassForm weekdays={await getWeekdayNames()} />;
}

export default function NewClassPage() {
  const t = useTranslations("classes");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("addClass")} description={t("form.description")} />
      <Suspense fallback={<Skeleton className="h-96 w-full max-w-2xl rounded-xl" />}>
        <NewClassForm />
      </Suspense>
    </div>
  );
}

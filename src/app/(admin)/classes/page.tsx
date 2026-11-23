import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ClassesTable } from "@/features/classes/components/classes-table";
import { listClasses } from "@/features/classes/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("classes");

  return { title: t("metaTitle") };
}

async function ClassesResults() {
  await connection();

  const classes = await listClasses();

  return <ClassesTable classes={classes} />;
}

export default function ClassesPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("nav.classes")} description={t("classes.description")} />
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <ClassesResults />
      </Suspense>
    </div>
  );
}

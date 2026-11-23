import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
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
      <PageHeader
        title={t("nav.classes")}
        description={t("classes.description")}
        action={
          <Link href="/classes/new" className={buttonVariants()}>
            <Plus data-icon="inline-start" aria-hidden />
            {t("classes.addClass")}
          </Link>
        }
      />
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <ClassesResults />
      </Suspense>
    </div>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { ClassForm } from "@/features/classes/components/class-form";
import { getClass } from "@/features/classes/queries";
import { getWeekdayNames } from "@/lib/get-date-labels";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  await connection();

  const { id } = await params;
  const klass = await getClass(id);
  if (!klass) return {};

  const t = await getTranslations("classes");
  const name = t("nameValue", { subject: klass.subject, grade: klass.grade });
  return { title: t("edit.metaTitle", { name }) };
}

async function EditClass({ params }: { params: Params }) {
  await connection();

  const { id } = await params;
  const klass = await getClass(id);
  if (!klass) notFound();

  const [t, weekdays] = await Promise.all([getTranslations("classes"), getWeekdayNames()]);
  const name = t("nameValue", { subject: klass.subject, grade: klass.grade });

  return (
    <>
      <PageHeader title={t("edit.title")} description={t("edit.description", { name })} />
      <ClassForm klass={klass} weekdays={weekdays} />
    </>
  );
}

export default function EditClassPage({ params }: { params: Params }) {
  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={<PageSkeleton />}>
        <EditClass params={params} />
      </Suspense>
    </div>
  );
}

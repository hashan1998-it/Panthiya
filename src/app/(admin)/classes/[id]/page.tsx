import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, Pencil } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClass, getClassEnrollments } from "@/features/classes/queries";
import { formatFee } from "@/lib/money";
import { formatWeekday } from "@/lib/schedule";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  await connection();

  const { id } = await params;
  const klass = await getClass(id);
  if (!klass) return {};

  const t = await getTranslations("classes");
  const name = t("nameValue", { subject: klass.subject, grade: klass.grade });
  return { title: t("detail.metaTitle", { name }) };
}

async function ClassDetail({ params }: { params: Params }) {
  await connection();

  const { id } = await params;
  const klass = await getClass(id);
  if (!klass) notFound();

  const [t, locale, enrollments] = await Promise.all([
    getTranslations("classes"),
    getLocale(),
    getClassEnrollments(klass.id),
  ]);

  const details = [
    { label: t("form.fields.subject"), value: klass.subject },
    { label: t("form.fields.grade"), value: t("gradeValue", { grade: klass.grade }) },
    { label: t("form.fields.day"), value: formatWeekday(klass.day_of_week, locale) },
    {
      label: t("columns.time"),
      value: t("timeValue", {
        start: klass.start_time.slice(0, 5),
        end: klass.end_time.slice(0, 5),
      }),
    },
    { label: t("form.fields.monthlyFee"), value: formatFee(klass.monthly_fee) },
    { label: t("columns.enrolled"), value: enrollments.length },
  ];

  return (
    <>
      <PageHeader
        title={t("nameValue", { subject: klass.subject, grade: klass.grade })}
        action={
          <Link href={`/classes/${klass.id}/edit`} className={buttonVariants()}>
            <Pencil data-icon="inline-start" aria-hidden />
            {t("detail.edit")}
          </Link>
        }
      />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t("detail.details")}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            {details.map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-1">
                <dt className="text-body-sm text-muted-foreground">{label}</dt>
                <dd className="text-body-sm text-foreground tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </>
  );
}

export default async function ClassPage({ params }: { params: Params }) {
  const t = await getTranslations("classes.detail");

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/classes"
        className={buttonVariants({ variant: "ghost", className: "-ml-3 self-start" })}
      >
        <ArrowLeft data-icon="inline-start" aria-hidden />
        {t("backToClasses")}
      </Link>
      <Suspense fallback={<PageSkeleton />}>
        <ClassDetail params={params} />
      </Suspense>
    </div>
  );
}

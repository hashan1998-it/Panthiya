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
import { ClassAttendance } from "@/features/attendance/components/class-attendance";
import { pickMonth } from "@/lib/months";
import { ClassStudentsTable } from "@/features/classes/components/class-students-table";
import { EnrollStudentsDialog } from "@/features/classes/components/enroll-students-dialog";
import { getClass, getClassEnrollments, getEnrollableStudents } from "@/features/classes/queries";
import { getToday } from "@/lib/dates";
import { getFormatFee } from "@/lib/get-format-fee";
import { formatWeekday } from "@/lib/schedule";
import { readParam } from "@/lib/table-params";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  await connection();

  const { id } = await params;
  const klass = await getClass(id);
  if (!klass) return {};

  const t = await getTranslations("classes");
  const name = t("nameValue", { subject: klass.subject, grade: klass.grade });
  return { title: t("detail.metaTitle", { name }) };
}

async function ClassDetail({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const formatFee = await getFormatFee();
  await connection();

  const [{ id }, raw] = await Promise.all([params, searchParams]);
  const today = getToday();
  const month = pickMonth(readParam(raw, "month"), today);
  const klass = await getClass(id);
  if (!klass) notFound();

  const [t, locale, enrollments, enrollableStudents] = await Promise.all([
    getTranslations("classes"),
    getLocale(),
    getClassEnrollments(klass.id),
    getEnrollableStudents(klass.id),
  ]);
  const name = t("nameValue", { subject: klass.subject, grade: klass.grade });

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
        title={name}
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
      <section aria-labelledby="class-students" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="class-students" className="text-title-md">
            {t("students.title")}
          </h2>
          <EnrollStudentsDialog
            classId={klass.id}
            className={name}
            grade={klass.grade}
            students={enrollableStudents}
          />
        </div>
        <ClassStudentsTable
          enrollments={enrollments}
          monthlyFee={klass.monthly_fee}
          className={name}
        />
      </section>
      <ClassAttendance
        classId={klass.id}
        dayOfWeek={klass.day_of_week}
        month={month}
        today={today}
      />
    </>
  );
}

export default async function ClassPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
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
        <ClassDetail params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

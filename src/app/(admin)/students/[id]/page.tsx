import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, Pencil } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentStatusDialog } from "@/features/students/components/student-status-dialog";
import { getStudent } from "@/features/students/queries";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  await connection();

  const { id } = await params;
  const student = await getStudent(id);
  if (!student) return {};

  const t = await getTranslations("students.profile");
  return { title: t("metaTitle", { name: student.full_name }) };
}

async function StudentProfile({ params }: { params: Params }) {
  await connection();

  const { id } = await params;
  const student = await getStudent(id);
  if (!student) notFound();

  const t = await getTranslations("students");
  const format = await getFormatter();

  const details = [
    { label: t("form.fields.admissionNo"), value: student.admission_no },
    { label: t("form.fields.grade"), value: t("filters.gradeOption", { grade: student.grade }) },
    { label: t("form.fields.phone"), value: student.phone },
    { label: t("form.fields.parentName"), value: student.parent_name },
    { label: t("form.fields.parentPhone"), value: student.parent_phone },
    {
      label: t("form.fields.joinedOn"),
      value: format.dateTime(new Date(student.joined_on), { dateStyle: "long" }),
    },
  ];

  return (
    <>
      <PageHeader
        title={student.full_name}
        action={
          <>
            {student.is_active ? (
              <Badge variant="success" className="self-center">
                {t("status.active")}
              </Badge>
            ) : (
              <Badge variant="neutral" className="self-center">
                {t("status.inactive")}
              </Badge>
            )}
            <Link href={`/students/${student.id}/edit`} className={buttonVariants()}>
              <Pencil data-icon="inline-start" aria-hidden />
              {t("profile.edit")}
            </Link>
            <StudentStatusDialog
              studentId={student.id}
              fullName={student.full_name}
              isActive={student.is_active}
              trigger={
                <Button variant="outline">
                  {student.is_active ? t("profile.deactivate") : t("profile.reactivate")}
                </Button>
              }
            />
          </>
        }
      />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t("profile.details")}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            {details.map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-1">
                <dt className="text-body-sm text-muted-foreground">{label}</dt>
                <dd className="text-body-sm text-foreground">{value ?? t("notSet")}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </>
  );
}

export default async function StudentPage({ params }: { params: Params }) {
  const t = await getTranslations("students.profile");

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/students"
        className={buttonVariants({ variant: "ghost", className: "-ml-3 self-start" })}
      >
        <ArrowLeft data-icon="inline-start" aria-hidden />
        {t("backToStudents")}
      </Link>
      <Suspense fallback={<PageSkeleton />}>
        <StudentProfile params={params} />
      </Suspense>
    </div>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, Pencil } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { StudentAttendanceTab } from "@/features/students/components/profile/student-attendance-tab";
import { StudentClassesTab } from "@/features/students/components/profile/student-classes-tab";
import { StudentPaymentsTab } from "@/features/students/components/profile/student-payments-tab";
import { StudentStatusDialog } from "@/features/students/components/student-status-dialog";
import {
  getStudentAttendance,
  getStudentEnrollments,
  getStudentPayments,
} from "@/features/students/profile-queries";
import { getStudent } from "@/features/students/queries";
import { cn } from "@/lib/utils";

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

  const [t, format, enrollments, attendance, payments] = await Promise.all([
    getTranslations("students"),
    getFormatter(),
    getStudentEnrollments(student.id),
    getStudentAttendance(student.id),
    getStudentPayments(student.id),
  ]);

  const statusLabel = student.is_active ? t("status.active") : t("status.inactive");

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
        titleAddon={
          <span
            role="img"
            aria-label={statusLabel}
            title={statusLabel}
            className={cn(
              "size-2.5 shrink-0 rounded-full",
              student.is_active ? "bg-success" : "bg-destructive",
            )}
          />
        }
        action={
          <>
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
      <Tabs defaultValue="details">
        <TabsList activateOnFocus>
          <TabsTab value="details">{t("profile.tabs.details")}</TabsTab>
          <TabsTab value="classes">{t("profile.tabs.classes")}</TabsTab>
          <TabsTab value="attendance">{t("profile.tabs.attendance")}</TabsTab>
          <TabsTab value="payments">{t("profile.tabs.payments")}</TabsTab>
        </TabsList>
        <TabsPanel value="details">
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
        </TabsPanel>
        <TabsPanel value="classes">
          <StudentClassesTab enrollments={enrollments} />
        </TabsPanel>
        <TabsPanel value="attendance">
          <StudentAttendanceTab enrollments={enrollments} attendance={attendance} />
        </TabsPanel>
        <TabsPanel value="payments">
          <StudentPaymentsTab payments={payments} />
        </TabsPanel>
      </Tabs>
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

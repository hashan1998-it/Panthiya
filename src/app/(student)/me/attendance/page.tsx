import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudentMonthAttendance } from "@/features/attendance/queries";
import { getMyStudent } from "@/features/portal/queries";
import { StudentAttendanceTab } from "@/features/students/components/profile/student-attendance-tab";
import { StudentMonthAttendance } from "@/features/students/components/profile/student-month-attendance";
import { getStudentAttendance, getStudentEnrollments } from "@/features/students/profile-queries";
import { getToday } from "@/lib/dates";
import { pickMonth } from "@/lib/months";
import { readParam } from "@/lib/table-params";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("me.attendance");

  return { title: t("metaTitle") };
}

async function MyAttendance({ searchParams }: { searchParams: SearchParams }) {
  await connection();

  const today = getToday();
  const [raw, student] = await Promise.all([searchParams, getMyStudent()]);
  const month = pickMonth(readParam(raw, "month"), today);
  const [enrollments, attendance, monthMarks] = await Promise.all([
    getStudentEnrollments(student.id),
    getStudentAttendance(student.id),
    getStudentMonthAttendance(student.id, month),
  ]);

  return (
    <>
      <StudentAttendanceTab enrollments={enrollments} attendance={attendance} />
      <StudentMonthAttendance
        enrollments={enrollments}
        marks={monthMarks}
        month={month}
        today={today}
      />
    </>
  );
}

export default function MyAttendancePage({ searchParams }: { searchParams: SearchParams }) {
  const t = useTranslations("me.attendance");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("title")} />
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <MyAttendance searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

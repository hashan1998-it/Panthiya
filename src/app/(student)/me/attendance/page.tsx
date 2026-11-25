import type { Metadata } from "next";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
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

export default async function MyAttendancePage({ searchParams }: { searchParams: SearchParams }) {
  await connection();

  const today = getToday();
  const [raw, student] = await Promise.all([searchParams, getMyStudent()]);
  const month = pickMonth(readParam(raw, "month"), today);
  const [t, enrollments, attendance, monthMarks] = await Promise.all([
    getTranslations("me.attendance"),
    getStudentEnrollments(student.id),
    getStudentAttendance(student.id),
    getStudentMonthAttendance(student.id, month),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("title")} />
      <StudentAttendanceTab enrollments={enrollments} attendance={attendance} />
      <StudentMonthAttendance
        enrollments={enrollments}
        marks={monthMarks}
        month={month}
        today={today}
      />
    </div>
  );
}

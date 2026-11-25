import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { summarizeAttendance } from "@/features/attendance/summary";
import { UnpaidDues } from "@/features/portal/components/unpaid-dues";
import { findNextClass } from "@/features/portal/next-class";
import { getMyStudent, listMyUnpaidDues } from "@/features/portal/queries";
import { StudentClassesTab } from "@/features/students/components/profile/student-classes-tab";
import { getStudentAttendance, getStudentEnrollments } from "@/features/students/profile-queries";
import { getCurrentTime, getToday } from "@/lib/dates";
import { formatFee } from "@/lib/money";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("me");

  return { title: t("metaTitle") };
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border p-6">
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="text-title-lg">{value}</dd>
      {hint && <dd className="text-caption text-muted-foreground">{hint}</dd>}
    </div>
  );
}

async function Overview() {
  await connection();

  const today = getToday();
  const student = await getMyStudent();
  const [t, format, enrollments, attendance, unpaid] = await Promise.all([
    getTranslations("me"),
    getFormatter(),
    getStudentEnrollments(student.id),
    getStudentAttendance(student.id),
    listMyUnpaidDues(student.id, today),
  ]);

  const activeClasses = enrollments.flatMap(({ class: klass, ended_on }) =>
    klass && ended_on === null ? [klass] : [],
  );
  const next = findNextClass(activeClasses, today, getCurrentTime());
  const rate = summarizeAttendance(attendance);
  const unpaidCents = unpaid.reduce((sum, due) => sum + Math.round(due.balance * 100), 0);

  const nextHint = next
    ? t(next.date === today ? "next.today" : "next.on", {
        date: format.dateTime(new Date(`${next.date}T00:00:00Z`), {
          weekday: "long",
          day: "numeric",
          month: "long",
          timeZone: "UTC",
        }),
        start: next.klass.start_time.slice(0, 5),
        end: next.klass.end_time.slice(0, 5),
      })
    : undefined;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("greeting", { name: student.full_name })}
        description={t("description", { admissionNo: student.admission_no, grade: student.grade })}
      />
      <dl className="grid gap-4 md:grid-cols-3">
        <Stat
          label={t("next.title")}
          value={
            next
              ? t("classValue", { subject: next.klass.subject, grade: next.klass.grade })
              : t("next.none")
          }
          hint={nextHint}
        />
        <Stat
          label={t("rate.title")}
          value={
            rate.rate === null
              ? t("rate.none")
              : format.number(rate.rate, { style: "percent", maximumFractionDigits: 0 })
          }
          hint={rate.total > 0 ? t("rate.hint", { count: rate.total }) : undefined}
        />
        <Stat
          label={t("unpaid.title")}
          value={unpaidCents === 0 ? t("unpaid.none") : formatFee(unpaidCents / 100)}
          hint={t("unpaid.hint", { count: unpaid.length })}
        />
      </dl>
      <UnpaidDues dues={unpaid} />
      <section aria-labelledby="my-classes" className="flex flex-col gap-4">
        <h2 id="my-classes" className="text-title-md">
          {t("title")}
        </h2>
        <StudentClassesTab enrollments={enrollments} />
      </section>
    </div>
  );
}

export default function MePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Overview />
    </Suspense>
  );
}

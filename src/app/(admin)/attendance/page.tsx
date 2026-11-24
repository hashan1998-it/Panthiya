import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { CalendarCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendancePicker } from "@/features/attendance/components/attendance-picker";
import { getAttendanceRoster, listAttendanceClasses } from "@/features/attendance/queries";
import { isSessionDate, listSessionDates } from "@/features/attendance/session-dates";
import { getToday } from "@/lib/dates";
import { readParam } from "@/lib/table-params";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("attendance");

  return { title: t("metaTitle") };
}

async function AttendanceEntry({ searchParams }: { searchParams: SearchParams }) {
  await connection();

  const raw = await searchParams;
  const [t, classes] = await Promise.all([getTranslations("attendance"), listAttendanceClasses()]);
  const today = getToday();

  const klass = classes.find((item) => item.id === readParam(raw, "class"));
  const requestedDate = readParam(raw, "date") ?? "";
  const sessionDate = klass
    ? isSessionDate(requestedDate, klass.day_of_week, today)
      ? requestedDate
      : listSessionDates(klass.day_of_week, today, 1)[0]
    : null;

  const roster = klass && sessionDate ? await getAttendanceRoster(klass.id, sessionDate) : [];
  const marked = roster.filter((student) => student.status !== null).length;

  return (
    <>
      <AttendancePicker
        classes={classes}
        classId={klass?.id ?? null}
        sessionDate={sessionDate}
        today={today}
      />
      {klass && sessionDate ? (
        <p className="text-body-sm text-muted-foreground">
          {t("summary", { total: roster.length, marked })}
        </p>
      ) : (
        <EmptyState
          icon={CalendarCheck}
          title={t("chooseTitle")}
          description={t("chooseDescription")}
        />
      )}
    </>
  );
}

export default function AttendancePage({ searchParams }: { searchParams: SearchParams }) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("nav.attendance")} description={t("attendance.description")} />
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <AttendanceEntry searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

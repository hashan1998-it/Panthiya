import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { CalendarCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { getFormatter, getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { UnsavedChangesProvider } from "@/components/shared/unsaved-changes";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendancePicker } from "@/features/attendance/components/attendance-picker";
import { AttendanceSheet } from "@/features/attendance/components/attendance-sheet";
import { getAttendanceRoster, listAttendanceClasses } from "@/features/attendance/queries";
import { isSessionDate, listSessionDates } from "@/features/attendance/session-dates";
import { getToday } from "@/lib/dates";
import { getWeekdayNames } from "@/lib/get-date-labels";
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

  const [roster, format, weekdays] = await Promise.all([
    klass && sessionDate ? getAttendanceRoster(klass.id, sessionDate) : [],
    getFormatter(),
    getWeekdayNames(),
  ]);
  const dateOptions = (klass ? listSessionDates(klass.day_of_week, today) : []).map((date) => {
    const label = format.dateTime(new Date(`${date}T00:00:00Z`), {
      dateStyle: "full",
      timeZone: "UTC",
    });
    return { value: date, label: date === today ? t("todayOption", { date: label }) : label };
  });

  return (
    <UnsavedChangesProvider>
      <AttendancePicker
        classes={classes}
        classId={klass?.id ?? null}
        sessionDate={sessionDate}
        dateOptions={dateOptions}
        weekdays={weekdays}
      />
      {klass && sessionDate ? (
        <AttendanceSheet
          key={`${klass.id}:${sessionDate}`}
          classId={klass.id}
          sessionDate={sessionDate}
          roster={roster}
        />
      ) : (
        <EmptyState
          icon={CalendarCheck}
          title={t("chooseTitle")}
          description={t("chooseDescription")}
        />
      )}
    </UnsavedChangesProvider>
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

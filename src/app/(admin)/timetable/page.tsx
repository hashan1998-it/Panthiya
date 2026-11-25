import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Timetable } from "@/features/timetable/components/timetable";
import { listTimetableClasses } from "@/features/timetable/queries";
import { getDayOfWeek, getToday } from "@/lib/dates";
import { getWeekdayNames } from "@/lib/get-date-labels";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("timetable");

  return { title: t("metaTitle") };
}

async function TimetableContent() {
  await connection();

  const [classes, weekdays] = await Promise.all([listTimetableClasses(), getWeekdayNames()]);

  return <Timetable classes={classes} today={getDayOfWeek(getToday())} weekdays={weekdays} />;
}

export default function TimetablePage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("nav.timetable")} description={t("timetable.description")} />
      <Suspense fallback={<Skeleton className="h-150 w-full rounded-xl" />}>
        <TimetableContent />
      </Suspense>
    </div>
  );
}

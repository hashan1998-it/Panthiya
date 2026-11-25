import { Suspense } from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ActiveStudentsStat,
  ClassesTodayStat,
  FeesStats,
  StatSkeleton,
} from "@/features/dashboard/components/dashboard-stats";
import { TodayClasses } from "@/features/dashboard/components/today-classes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");

  return { title: t("metaTitle") };
}

export default function DashboardPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("nav.dashboard")} description={t("dashboard.description")} />
      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Suspense fallback={<StatSkeleton />}>
          <ActiveStudentsStat />
        </Suspense>
        <Suspense fallback={<StatSkeleton />}>
          <ClassesTodayStat />
        </Suspense>
        <Suspense
          fallback={
            <>
              <StatSkeleton />
              <StatSkeleton />
            </>
          }
        >
          <FeesStats />
        </Suspense>
      </dl>
      <section aria-labelledby="today-classes" className="flex flex-col gap-4">
        <h2 id="today-classes" className="text-title-md">
          {t("dashboard.today.title")}
        </h2>
        <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
          <TodayClasses />
        </Suspense>
      </section>
    </div>
  );
}

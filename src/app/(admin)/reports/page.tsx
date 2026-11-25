import { Suspense } from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import {
  AttendanceReport,
  IncomeReport,
  ReportSkeleton,
  StudentsReport,
} from "@/features/reports/components/report-sections";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("reports");

  return { title: t("metaTitle") };
}

export default function ReportsPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("nav.reports")} description={t("reports.description")} />
      <Suspense fallback={<ReportSkeleton />}>
        <IncomeReport />
      </Suspense>
      <div className="grid gap-8 lg:grid-cols-2">
        <Suspense fallback={<ReportSkeleton />}>
          <AttendanceReport />
        </Suspense>
        <Suspense fallback={<ReportSkeleton />}>
          <StudentsReport />
        </Suspense>
      </div>
    </div>
  );
}

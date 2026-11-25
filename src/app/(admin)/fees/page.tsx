import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { useTranslations } from "next-intl";
import { getFormatter, getTranslations } from "next-intl/server";
import { MonthPicker } from "@/components/shared/month-picker";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { GenerateDuesButton } from "@/features/fees/components/generate-dues-button";
import { getDuesSummary } from "@/features/fees/queries";
import { listDueMonths, pickDueMonth } from "@/features/fees/schema";
import { getToday } from "@/lib/dates";
import { formatFee } from "@/lib/money";
import { readParam } from "@/lib/table-params";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("fees");

  return { title: t("metaTitle") };
}

async function FeesMonth({ searchParams }: { searchParams: SearchParams }) {
  await connection();

  const raw = await searchParams;
  const today = getToday();
  const month = pickDueMonth(readParam(raw, "month"), today);
  const [t, format, summary] = await Promise.all([
    getTranslations("fees.summary"),
    getFormatter(),
    getDuesSummary(month),
  ]);

  const monthLabel = format.dateTime(new Date(`${month}-01T00:00:00Z`), {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const stats = [
    { label: t("dues", { month: monthLabel }), value: t("duesValue", { count: summary.count }) },
    { label: t("total"), value: formatFee(summary.totalDue) },
    { label: t("free"), value: t("freeValue", { count: summary.freeCount }) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MonthPicker id="fees-month" month={month} months={listDueMonths(today)} />
        <GenerateDuesButton month={month} />
      </div>
      <dl className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-1 rounded-xl border border-border p-6">
            <dt className="text-caption text-muted-foreground">{label}</dt>
            <dd className="text-title-lg tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function FeesPage({ searchParams }: { searchParams: SearchParams }) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("nav.fees")} description={t("fees.description")} />
      <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
        <FeesMonth searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

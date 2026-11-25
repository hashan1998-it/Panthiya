import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ListTodo } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { MonthPicker } from "@/components/shared/month-picker";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FeesTable } from "@/features/fees/components/fees-table";
import { GenerateDuesButton } from "@/features/fees/components/generate-dues-button";
import { DUE_SORTABLE_COLUMNS, parseDueFilters } from "@/features/fees/filters";
import { getFeesTotals, listDues, listFeeClasses } from "@/features/fees/queries";
import { listDueMonths, pickDueMonth } from "@/features/fees/schema";
import { getToday } from "@/lib/dates";
import { formatFee } from "@/lib/money";
import { parseTableParams, readParam } from "@/lib/table-params";

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
  const filters = parseDueFilters(raw);
  const params = parseTableParams(raw, DUE_SORTABLE_COLUMNS);
  const [t, totals, { dues, rowCount }, classes] = await Promise.all([
    getTranslations("fees.summary"),
    getFeesTotals(month, filters.classId),
    listDues(month, params, filters),
    listFeeClasses(),
  ]);

  const stats = [
    { label: t("due"), value: formatFee(totals.due) },
    { label: t("collected"), value: formatFee(totals.collected) },
    { label: t("outstanding"), value: formatFee(totals.outstanding) },
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
      <FeesTable dues={dues} rowCount={rowCount} classes={classes} />
    </div>
  );
}

export default function FeesPage({ searchParams }: { searchParams: SearchParams }) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("nav.fees")}
        description={t("fees.description")}
        action={
          <Link href="/fees/unpaid" className={buttonVariants({ variant: "outline" })}>
            <ListTodo data-icon="inline-start" aria-hidden />
            {t("fees.unpaid.link")}
          </Link>
        }
      />
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <FeesMonth searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

import { connection } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { Skeleton } from "@/components/ui/skeleton";
import { getToday } from "@/lib/dates";
import { getFormatFee } from "@/lib/get-format-fee";
import { getMonthlyIncome, listClassAttendanceRates, listClassEnrollmentCounts } from "../queries";
import { BarReport } from "./bar-report";
import { ReportFigure } from "./report-figure";

export function ReportSkeleton() {
  return <Skeleton className="h-96 w-full rounded-xl" />;
}

export async function IncomeReport() {
  const formatFee = await getFormatFee();
  await connection();

  const [t, format, income] = await Promise.all([
    getTranslations("reports.income"),
    getFormatter(),
    getMonthlyIncome(getToday()),
  ]);

  const monthLabel = (month: string, style: "short" | "long") =>
    format.dateTime(new Date(`${month}-01T00:00:00Z`), {
      month: style,
      year: style === "long" ? "numeric" : undefined,
      timeZone: "UTC",
    });

  const totalCents = income.reduce((sum, row) => sum + Math.round(row.collected * 100), 0);
  const best = income.reduce((top, row) => (row.collected > top.collected ? row : top));

  return (
    <ReportFigure
      id="report-income"
      title={t("title")}
      description={t("description", { count: income.length })}
      summary={
        totalCents === 0
          ? t("summaryEmpty")
          : t("summary", {
              total: formatFee(totalCents / 100),
              month: monthLabel(best.month, "long"),
              amount: formatFee(best.collected),
            })
      }
      labelHeader={t("month")}
      valueHeader={t("series")}
      rows={income.map((row) => ({
        label: monthLabel(row.month, "long"),
        value: formatFee(row.collected),
      }))}
    >
      <BarReport
        layout="columns"
        format="fee"
        seriesLabel={t("series")}
        data={income.map((row) => ({
          label: monthLabel(row.month, "short"),
          value: row.collected,
        }))}
      />
    </ReportFigure>
  );
}

export async function AttendanceReport() {
  await connection();

  const [t, tFees, format, rates] = await Promise.all([
    getTranslations("reports.attendance"),
    getTranslations("fees"),
    getFormatter(),
    listClassAttendanceRates(),
  ]);

  const name = (row: { subject: string; grade: number }) =>
    tFees("classValue", { subject: row.subject, grade: row.grade });
  const percent = (rate: number) =>
    format.number(rate, { style: "percent", maximumFractionDigits: 0 });

  const marked = rates.flatMap((row) => (row.rate === null ? [] : [{ ...row, rate: row.rate }]));
  const lowest = marked.reduce<(typeof marked)[number] | null>(
    (low, row) => (low === null || row.rate < low.rate ? row : low),
    null,
  );

  return (
    <ReportFigure
      id="report-attendance"
      title={t("title")}
      description={t("description")}
      summary={
        lowest
          ? t("summary", { name: name(lowest), rate: percent(lowest.rate) })
          : t("summaryEmpty")
      }
      labelHeader={t("class")}
      valueHeader={t("series")}
      rows={rates.map((row) => ({
        label: name(row),
        value: row.rate === null ? t("noData") : percent(row.rate),
      }))}
    >
      <BarReport
        layout="rows"
        format="percent"
        seriesLabel={t("series")}
        data={marked.map((row) => ({ label: name(row), value: row.rate }))}
      />
    </ReportFigure>
  );
}

export async function StudentsReport() {
  await connection();

  const [t, tFees, counts] = await Promise.all([
    getTranslations("reports.students"),
    getTranslations("fees"),
    listClassEnrollmentCounts(),
  ]);

  const name = (row: { subject: string; grade: number }) =>
    tFees("classValue", { subject: row.subject, grade: row.grade });
  const total = counts.reduce((sum, row) => sum + row.students, 0);

  return (
    <ReportFigure
      id="report-students"
      title={t("title")}
      description={t("description")}
      summary={t("summary", { total, classes: counts.length })}
      labelHeader={t("class")}
      valueHeader={t("series")}
      rows={counts.map((row) => ({ label: name(row), value: String(row.students) }))}
    >
      <BarReport
        layout="rows"
        format="count"
        seriesLabel={t("series")}
        data={counts.map((row) => ({ label: name(row), value: row.students }))}
      />
    </ReportFigure>
  );
}

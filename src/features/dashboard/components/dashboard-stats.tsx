import { connection } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { Skeleton } from "@/components/ui/skeleton";
import { getFeesTotals } from "@/features/fees/queries";
import { getCurrentMonth, getToday } from "@/lib/dates";
import { getFormatFee } from "@/lib/get-format-fee";
import { countActiveStudents, listClassesOn } from "../queries";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border p-6">
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="text-title-lg tabular-nums">{value}</dd>
      {hint && <dd className="text-caption text-muted-foreground">{hint}</dd>}
    </div>
  );
}

export function StatSkeleton() {
  return <Skeleton className="h-28 w-full rounded-xl" />;
}

export async function ActiveStudentsStat() {
  await connection();

  const [t, count] = await Promise.all([getTranslations("dashboard.stats"), countActiveStudents()]);

  return <Stat label={t("activeStudents")} value={String(count)} />;
}

export async function ClassesTodayStat() {
  await connection();

  const [t, classes] = await Promise.all([
    getTranslations("dashboard.stats"),
    listClassesOn(getToday()),
  ]);

  return <Stat label={t("classesToday")} value={String(classes.length)} />;
}

export async function FeesStats() {
  const formatFee = await getFormatFee();
  await connection();

  const month = getCurrentMonth();
  const [t, format, totals] = await Promise.all([
    getTranslations("dashboard.stats"),
    getFormatter(),
    getFeesTotals(month, null),
  ]);

  const hint = t("monthHint", {
    month: format.dateTime(new Date(`${month}-01T00:00:00Z`), {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
  });

  return (
    <>
      <Stat label={t("collected")} value={formatFee(totals.collected)} hint={hint} />
      <Stat label={t("outstanding")} value={formatFee(totals.outstanding)} hint={hint} />
    </>
  );
}

import Link from "next/link";
import { connection } from "next/server";
import { CalendarCheck, ChevronRight } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { getToday } from "@/lib/dates";
import { listClassesOn } from "../queries";

export async function TodayClasses() {
  await connection();

  const today = getToday();
  const [t, tFees, format, classes] = await Promise.all([
    getTranslations("dashboard.today"),
    getTranslations("fees"),
    getFormatter(),
    listClassesOn(today),
  ]);

  const date = format.dateTime(new Date(`${today}T00:00:00Z`), {
    dateStyle: "full",
    timeZone: "UTC",
  });

  if (classes.length === 0) {
    return (
      <EmptyState
        icon={CalendarCheck}
        title={t("emptyTitle")}
        description={t("emptyDescription", { date })}
      />
    );
  }

  return (
    <ul
      aria-label={t("label", { date })}
      className="divide-y divide-border rounded-xl border border-border"
    >
      {classes.map((klass) => {
        const name = tFees("classValue", { subject: klass.subject, grade: klass.grade });

        return (
          <li key={klass.id}>
            <Link
              href={`/attendance?class=${klass.id}&date=${today}`}
              aria-label={t("markAttendance", { name })}
              className="flex items-center gap-4 px-4 py-3 hover:bg-muted"
            >
              <span className="w-28 shrink-0 text-body-sm text-muted-foreground tabular-nums">
                {t("time", {
                  start: klass.start_time.slice(0, 5),
                  end: klass.end_time.slice(0, 5),
                })}
              </span>
              <span className="min-w-0 flex-1 truncate text-body-sm text-foreground">{name}</span>
              <span className="text-body-sm text-muted-foreground tabular-nums">
                {t("students", { count: klass.enrolled_count })}
              </span>
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

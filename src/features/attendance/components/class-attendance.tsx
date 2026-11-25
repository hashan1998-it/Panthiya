import { CalendarCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { getClassMonthAttendance } from "../queries";
import { listMonthSessionDates } from "../session-dates";
import { AttendanceGrid } from "./attendance-grid";
import { MonthPicker } from "./month-picker";

type ClassAttendanceProps = {
  classId: string;
  dayOfWeek: number;
  month: string;
  today: string;
};

export async function ClassAttendance({ classId, dayOfWeek, month, today }: ClassAttendanceProps) {
  const t = await getTranslations("attendance.history");
  const dates = listMonthSessionDates(dayOfWeek, month, today);
  const rows = dates.length > 0 ? await getClassMonthAttendance(classId, month) : [];

  return (
    <section aria-labelledby="class-attendance" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="class-attendance" className="text-title-md">
          {t("classTitle")}
        </h2>
        <MonthPicker id="class-attendance-month" month={month} today={today} />
      </div>
      {dates.length === 0 || rows.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={dates.length === 0 ? t("noSessionsTitle") : t("noStudentsTitle")}
          description={dates.length === 0 ? t("noSessionsDescription") : t("noStudentsDescription")}
        />
      ) : (
        <AttendanceGrid
          label={t("classTitle")}
          rowHeader={t("student")}
          dates={dates}
          rows={rows.map((row) => ({
            id: row.id,
            marks: row.marks,
            label: (
              <span className="flex flex-col">
                <span className="inline-flex items-center gap-2 text-foreground">
                  {row.full_name}
                  {!row.is_active && <Badge variant="neutral">{t("inactive")}</Badge>}
                </span>
                <span className="font-mono text-caption text-muted-foreground">
                  {row.admission_no}
                </span>
              </span>
            ),
          }))}
        />
      )}
    </section>
  );
}

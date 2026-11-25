import { CalendarCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { MonthPicker } from "@/components/shared/month-picker";
import { AttendanceGrid } from "@/features/attendance/components/attendance-grid";
import type { StudentMonthMark } from "@/features/attendance/queries";
import { listMonthSessionDates } from "@/features/attendance/session-dates";
import type { AttendanceStatus } from "@/features/attendance/summary";
import { getMonthOptions } from "@/lib/get-date-labels";
import { listRecentMonths } from "@/lib/months";
import type { StudentEnrollment } from "../../profile-queries";

type StudentMonthAttendanceProps = {
  enrollments: StudentEnrollment[];
  marks: StudentMonthMark[];
  month: string;
  today: string;
};

export async function StudentMonthAttendance({
  enrollments,
  marks,
  month,
  today,
}: StudentMonthAttendanceProps) {
  const t = await getTranslations();
  const first = `${month}-01`;
  const markedClassIds = new Set(marks.map((mark) => mark.class_id));

  const rows = enrollments.flatMap(({ class: klass, enrolled_on, ended_on }) => {
    if (!klass) return [];
    const coversMonth = enrolled_on.slice(0, 7) <= month && (!ended_on || ended_on >= first);
    if (!coversMonth && !markedClassIds.has(klass.id)) return [];

    const sessionDates = listMonthSessionDates(klass.day_of_week, month, today);
    const classMarks: Record<string, AttendanceStatus> = {};
    for (const mark of marks) {
      if (mark.class_id === klass.id) classMarks[mark.session_date] = mark.status;
    }

    return [
      {
        id: klass.id,
        sessionDates,
        marks: classMarks,
        label: (
          <span className="text-foreground">
            {t("students.profile.classes.classValue", {
              subject: klass.subject,
              grade: klass.grade,
            })}
          </span>
        ),
      },
    ];
  });

  const dates = [...new Set(rows.flatMap((row) => row.sessionDates))].sort();

  return (
    <section aria-labelledby="student-month-attendance" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="student-month-attendance" className="text-title-sm">
          {t("attendance.history.studentTitle")}
        </h3>
        <MonthPicker
          id="student-attendance-month"
          month={month}
          options={await getMonthOptions(listRecentMonths(today))}
          params={{ tab: "attendance" }}
        />
      </div>
      {dates.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={t("attendance.history.noSessionsTitle")}
          description={t("attendance.history.noStudentSessionsDescription")}
        />
      ) : (
        <AttendanceGrid
          label={t("attendance.history.studentTitle")}
          rowHeader={t("attendance.history.class")}
          dates={dates}
          rows={rows}
        />
      )}
    </section>
  );
}

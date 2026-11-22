import { CalendarCheck } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { summarizeAttendance, summarizeAttendanceByClass } from "@/features/attendance/summary";
import type { StudentAttendanceRow, StudentEnrollment } from "../../profile-queries";

type StudentAttendanceTabProps = {
  enrollments: StudentEnrollment[];
  attendance: StudentAttendanceRow[];
};

export async function StudentAttendanceTab({ enrollments, attendance }: StudentAttendanceTabProps) {
  const t = await getTranslations("students");
  const format = await getFormatter();

  const overall = summarizeAttendance(attendance);

  if (overall.total === 0) {
    return (
      <EmptyState
        icon={CalendarCheck}
        title={t("profile.attendance.emptyTitle")}
        description={t("profile.attendance.emptyDescription")}
      />
    );
  }

  const byClass = summarizeAttendanceByClass(attendance);
  const percent = (rate: number | null) =>
    rate === null ? t("notSet") : format.number(rate, { style: "percent" });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 rounded-xl border border-border p-6">
        <p className="text-caption text-muted-foreground">{t("profile.attendance.overall")}</p>
        <p className="text-display-sm tabular-nums">{percent(overall.rate)}</p>
        <p className="text-body-sm text-muted-foreground">
          {t("profile.attendance.overallValue", { total: overall.total })}{" "}
          {t("profile.attendance.lateNote")}
        </p>
      </div>
      <Table aria-label={t("profile.attendance.label")}>
        <TableHeader>
          <TableRow>
            <TableHead>{t("profile.attendance.class")}</TableHead>
            <TableHead className="text-right">{t("profile.attendance.present")}</TableHead>
            <TableHead className="text-right">{t("profile.attendance.late")}</TableHead>
            <TableHead className="text-right">{t("profile.attendance.absent")}</TableHead>
            <TableHead className="text-right">{t("profile.attendance.rate")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => {
            const { class: klass } = enrollment;
            if (!klass) return null;
            const summary = byClass.get(klass.id);

            return (
              <TableRow key={enrollment.id}>
                <TableCell className="text-foreground">
                  {t("profile.classes.classValue", { subject: klass.subject, grade: klass.grade })}
                </TableCell>
                <TableCell className="text-right tabular-nums">{summary?.present ?? 0}</TableCell>
                <TableCell className="text-right tabular-nums">{summary?.late ?? 0}</TableCell>
                <TableCell className="text-right tabular-nums">{summary?.absent ?? 0}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {percent(summary?.rate ?? null)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

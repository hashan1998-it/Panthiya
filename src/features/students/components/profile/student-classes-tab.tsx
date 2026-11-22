import { BookOpen } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StudentEnrollment } from "../../profile-queries";

const FIRST_SUNDAY_OF_2026 = Date.UTC(2026, 0, 4);
const DAY_MS = 24 * 60 * 60 * 1000;

type StudentClassesTabProps = {
  enrollments: StudentEnrollment[];
};

export async function StudentClassesTab({ enrollments }: StudentClassesTabProps) {
  const t = await getTranslations("students.profile.classes");
  const format = await getFormatter();

  if (enrollments.length === 0) {
    return (
      <EmptyState icon={BookOpen} title={t("emptyTitle")} description={t("emptyDescription")} />
    );
  }

  const weekday = (dayOfWeek: number) =>
    format.dateTime(new Date(FIRST_SUNDAY_OF_2026 + dayOfWeek * DAY_MS), {
      weekday: "long",
      timeZone: "UTC",
    });

  const discountLabel = (enrollment: StudentEnrollment) => {
    switch (enrollment.discount_type) {
      case "half":
        return t("discountHalf");
      case "free":
        return t("discountFree");
      case "custom":
        return t("discountCustom", { percent: enrollment.discount_percent });
      default:
        return t("discountNone");
    }
  };

  return (
    <Table aria-label={t("label")}>
      <TableHeader>
        <TableRow>
          <TableHead>{t("class")}</TableHead>
          <TableHead>{t("schedule")}</TableHead>
          <TableHead className="text-right">{t("monthlyFee")}</TableHead>
          <TableHead>{t("discount")}</TableHead>
          <TableHead>{t("status")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {enrollments.map((enrollment) => {
          const { class: klass } = enrollment;
          if (!klass) return null;

          return (
            <TableRow key={enrollment.id}>
              <TableCell className="text-foreground">
                {t("classValue", { subject: klass.subject, grade: klass.grade })}
              </TableCell>
              <TableCell>
                {t("scheduleValue", {
                  day: weekday(klass.day_of_week),
                  start: klass.start_time.slice(0, 5),
                  end: klass.end_time.slice(0, 5),
                })}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {format.number(klass.monthly_fee, "money")}
              </TableCell>
              <TableCell>{discountLabel(enrollment)}</TableCell>
              <TableCell>
                {enrollment.ended_on ? (
                  <Badge variant="neutral">
                    {t("ended", {
                      date: format.dateTime(new Date(enrollment.ended_on), {
                        dateStyle: "medium",
                      }),
                    })}
                  </Badge>
                ) : (
                  <Badge variant="success">{t("active")}</Badge>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

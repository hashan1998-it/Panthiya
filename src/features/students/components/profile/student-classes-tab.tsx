import { BookOpen } from "lucide-react";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
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
import { formatFee } from "@/lib/money";
import { formatWeekday } from "@/lib/schedule";
import type { StudentEnrollment } from "../../profile-queries";

type StudentClassesTabProps = {
  enrollments: StudentEnrollment[];
};

export async function StudentClassesTab({ enrollments }: StudentClassesTabProps) {
  const t = await getTranslations("students.profile.classes");
  const format = await getFormatter();
  const locale = await getLocale();

  if (enrollments.length === 0) {
    return (
      <EmptyState icon={BookOpen} title={t("emptyTitle")} description={t("emptyDescription")} />
    );
  }

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
                  day: formatWeekday(klass.day_of_week, locale),
                  start: klass.start_time.slice(0, 5),
                  end: klass.end_time.slice(0, 5),
                })}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatFee(klass.monthly_fee)}
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

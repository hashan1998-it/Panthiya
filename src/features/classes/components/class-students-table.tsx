import { Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
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
import { calculateAmountDue } from "@/lib/fees";
import { getFormatFee } from "@/lib/get-format-fee";
import type { ClassEnrollment } from "../queries";
import { EnrolledStudentActions } from "./enrolled-student-actions";

type ClassStudentsTableProps = {
  enrollments: ClassEnrollment[];
  monthlyFee: number;
  className: string;
};

export async function ClassStudentsTable({
  enrollments,
  monthlyFee,
  className,
}: ClassStudentsTableProps) {
  const t = await getTranslations("classes.students");
  const formatFee = await getFormatFee();

  if (enrollments.length === 0) {
    return <EmptyState icon={Users} title={t("emptyTitle")} description={t("emptyDescription")} />;
  }

  const discountBadge = (enrollment: ClassEnrollment) => {
    switch (enrollment.discount_type) {
      case "half":
        return <Badge variant="discount-half">{t("discountHalf")}</Badge>;
      case "free":
        return <Badge variant="discount-free">{t("discountFree")}</Badge>;
      case "custom":
        return (
          <Badge variant="discount-custom">
            {t("discountCustom", { percent: enrollment.discount_percent })}
          </Badge>
        );
      default:
        return <span className="text-muted-foreground">{t("discountNone")}</span>;
    }
  };

  return (
    <Table aria-label={t("label")}>
      <TableHeader>
        <TableRow>
          <TableHead>{t("admissionNo")}</TableHead>
          <TableHead>{t("name")}</TableHead>
          <TableHead>{t("discount")}</TableHead>
          <TableHead className="text-right">{t("effectiveFee")}</TableHead>
          <TableHead>
            <span className="sr-only">{t("actions")}</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {enrollments.map((enrollment) => {
          const { student } = enrollment;

          return (
            <TableRow key={enrollment.id}>
              <TableCell className="font-mono">{student.admission_no}</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-2">
                  <span className="text-foreground">{student.full_name}</span>
                  {!student.is_active && <Badge variant="neutral">{t("inactive")}</Badge>}
                </span>
              </TableCell>
              <TableCell>{discountBadge(enrollment)}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatFee(calculateAmountDue(monthlyFee, enrollment.discount_percent))}
              </TableCell>
              <TableCell className="text-right">
                <EnrolledStudentActions
                  enrollmentId={enrollment.id}
                  student={student}
                  className={className}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

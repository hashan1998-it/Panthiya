import Link from "next/link";
import { BookOpen, Pencil } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
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
import type { ClassListItem } from "../queries";

type ClassesTableProps = {
  classes: ClassListItem[];
};

export async function ClassesTable({ classes }: ClassesTableProps) {
  const t = await getTranslations("classes");
  const locale = await getLocale();

  if (classes.length === 0) {
    return (
      <EmptyState icon={BookOpen} title={t("emptyTitle")} description={t("emptyDescription")} />
    );
  }

  return (
    <Table aria-label={t("label")}>
      <TableHeader>
        <TableRow>
          <TableHead>{t("columns.subject")}</TableHead>
          <TableHead>{t("columns.grade")}</TableHead>
          <TableHead>{t("columns.day")}</TableHead>
          <TableHead>{t("columns.time")}</TableHead>
          <TableHead className="text-right">{t("columns.monthlyFee")}</TableHead>
          <TableHead className="text-right">{t("columns.enrolled")}</TableHead>
          <TableHead>
            <span className="sr-only">{t("columns.actions")}</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {classes.map((klass) => (
          <TableRow key={klass.id}>
            <TableCell className="text-foreground">{klass.subject}</TableCell>
            <TableCell>{t("gradeValue", { grade: klass.grade })}</TableCell>
            <TableCell>{formatWeekday(klass.day_of_week, locale)}</TableCell>
            <TableCell className="tabular-nums">
              {t("timeValue", {
                start: klass.start_time.slice(0, 5),
                end: klass.end_time.slice(0, 5),
              })}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatFee(klass.monthly_fee)}
            </TableCell>
            <TableCell className="text-right tabular-nums">{klass.enrolled_count}</TableCell>
            <TableCell className="text-right">
              <Link
                href={`/classes/${klass.id}/edit`}
                aria-label={t("edit.label", {
                  name: t("nameValue", { subject: klass.subject, grade: klass.grade }),
                })}
                className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
              >
                <Pencil aria-hidden />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { PartyPopper } from "lucide-react";
import { useTranslations } from "next-intl";
import { getFormatter, getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listStudentsOutstanding } from "@/features/fees/queries";
import { getToday } from "@/lib/dates";
import { getFormatFee } from "@/lib/get-format-fee";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("fees.unpaid");

  return { title: t("metaTitle") };
}

async function UnpaidList() {
  const formatFee = await getFormatFee();
  await connection();

  const today = getToday();
  const [t, tFees, format, students] = await Promise.all([
    getTranslations("fees.unpaid"),
    getTranslations("fees"),
    getFormatter(),
    listStudentsOutstanding(today),
  ]);

  const formatMonth = (month: string) =>
    format.dateTime(new Date(`${month}-01T00:00:00Z`), {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });

  if (students.length === 0) {
    return (
      <EmptyState
        icon={PartyPopper}
        title={t("empty.title")}
        description={t("empty.description")}
      />
    );
  }

  const totalCents = students.reduce((sum, student) => sum + Math.round(student.total * 100), 0);

  return (
    <>
      <p className="text-body-sm text-muted-foreground">
        {t("summary", {
          count: students.length,
          amount: formatFee(totalCents / 100),
          month: formatMonth(today.slice(0, 7)),
        })}
      </p>
      <div className="rounded-xl border border-border">
        <Table aria-label={t("label")}>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.student")}</TableHead>
              <TableHead>{t("columns.classes")}</TableHead>
              <TableHead>{t("columns.months")}</TableHead>
              <TableHead>{t("columns.oldest")}</TableHead>
              <TableHead className="text-right">{t("columns.outstanding")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.studentId}>
                <TableCell>
                  <Link
                    href={`/students/${student.studentId}?tab=payments`}
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    {student.fullName}
                  </Link>
                  <span className="block font-mono text-caption text-muted-foreground">
                    {student.admissionNo}
                  </span>
                </TableCell>
                <TableCell>
                  {student.classes
                    .map((klass) =>
                      tFees("classValue", { subject: klass.subject, grade: klass.grade }),
                    )
                    .join(", ")}
                </TableCell>
                <TableCell className="tabular-nums">
                  {t("monthsValue", { count: student.monthCount })}
                </TableCell>
                <TableCell>{formatMonth(student.oldestMonth)}</TableCell>
                <TableCell className="text-right text-foreground tabular-nums">
                  {formatFee(student.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export default function UnpaidPage() {
  const t = useTranslations("fees.unpaid");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <UnpaidList />
      </Suspense>
    </div>
  );
}

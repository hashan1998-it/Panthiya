import { Wallet } from "lucide-react";
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
import { formatFee } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { StudentPayment } from "../../profile-queries";

type StudentPaymentsTabProps = {
  payments: StudentPayment[];
};

export async function StudentPaymentsTab({ payments }: StudentPaymentsTabProps) {
  const t = await getTranslations("students.profile.payments");
  const format = await getFormatter();

  if (payments.length === 0) {
    return <EmptyState icon={Wallet} title={t("emptyTitle")} description={t("emptyDescription")} />;
  }

  const month = (value: string) =>
    format.dateTime(new Date(value), { month: "long", year: "numeric" });

  return (
    <Table aria-label={t("label")}>
      <TableHeader>
        <TableRow>
          <TableHead>{t("paidOn")}</TableHead>
          <TableHead>{t("receiptNo")}</TableHead>
          <TableHead>{t("for")}</TableHead>
          <TableHead>{t("method")}</TableHead>
          <TableHead className="text-right">{t("amount")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => {
          const voided = payment.voided_at !== null;

          return (
            <TableRow key={payment.id}>
              <TableCell className="tabular-nums">
                {format.dateTime(new Date(payment.paid_on), { dateStyle: "medium" })}
              </TableCell>
              <TableCell className="font-mono">{payment.receipt_no}</TableCell>
              <TableCell className="text-foreground">
                {t("forValue", {
                  subject: payment.due.enrollment.class?.subject ?? "",
                  month: month(payment.due.month),
                })}
              </TableCell>
              <TableCell>
                {payment.method === "bank_transfer" ? t("methodBankTransfer") : t("methodCash")}
              </TableCell>
              <TableCell className="text-right">
                <span className="inline-flex items-center gap-2">
                  {voided && <Badge variant="neutral">{t("voided")}</Badge>}
                  <span
                    className={cn("tabular-nums", voided && "text-muted-foreground line-through")}
                  >
                    {formatFee(payment.amount)}
                  </span>
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

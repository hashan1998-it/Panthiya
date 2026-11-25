import { getFormatter, getTranslations } from "next-intl/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getFormatFee } from "@/lib/get-format-fee";
import type { UnpaidDue } from "../queries";

export async function UnpaidDues({ dues }: { dues: UnpaidDue[] }) {
  const formatFee = await getFormatFee();
  const [t, format] = await Promise.all([getTranslations("me"), getFormatter()]);

  if (dues.length === 0) return null;

  return (
    <section aria-labelledby="unpaid-dues" className="flex flex-col gap-4">
      <h2 id="unpaid-dues" className="text-title-md">
        {t("unpaid.listTitle")}
      </h2>
      <div className="rounded-xl border border-border">
        <Table aria-label={t("unpaid.label")}>
          <TableHeader>
            <TableRow>
              <TableHead>{t("unpaid.month")}</TableHead>
              <TableHead>{t("unpaid.class")}</TableHead>
              <TableHead className="text-right">{t("unpaid.balance")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dues.map((due) => (
              <TableRow key={due.id}>
                <TableCell>
                  {format.dateTime(new Date(`${due.month}-01T00:00:00Z`), {
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </TableCell>
                <TableCell className="text-foreground">
                  {t("classValue", { subject: due.subject, grade: due.grade })}
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatFee(due.balance)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

import type { NextRequest } from "next/server";
import { getTranslations } from "next-intl/server";
import { DUE_SORTABLE_COLUMNS, parseDueFilters } from "@/features/fees/filters";
import { listDues } from "@/features/fees/queries";
import { pickDueMonth } from "@/features/fees/schema";
import { requireRole } from "@/lib/auth/require-role";
import { csvResponse, EXPORT_ROW_LIMIT, toCsv } from "@/lib/csv";
import { getToday } from "@/lib/dates";
import { parseTableParams, readParam } from "@/lib/table-params";

export async function GET(request: NextRequest) {
  await requireRole("admin");

  const raw = request.nextUrl.searchParams;
  const month = pickDueMonth(readParam(raw, "month"), getToday());
  const params = parseTableParams(raw, DUE_SORTABLE_COLUMNS);
  const [t, { dues }] = await Promise.all([
    getTranslations("fees"),
    listDues(month, { ...params, page: 1, pageSize: EXPORT_ROW_LIMIT }, parseDueFilters(raw)),
  ]);

  const csv = toCsv(
    [
      t("columns.admissionNo"),
      t("columns.name"),
      t("columns.class"),
      t("export.month"),
      t("columns.due"),
      t("columns.paid"),
      t("columns.balance"),
      t("columns.status"),
    ],
    dues.map((due) => [
      due.admission_no,
      due.full_name,
      t("classValue", { subject: due.subject, grade: due.grade }),
      month,
      due.amount_due.toFixed(2),
      due.paid_amount.toFixed(2),
      due.balance.toFixed(2),
      t(`status.${due.status}`),
    ]),
  );

  return csvResponse(csv, `fees-${month}.csv`);
}

"use client";

import { useMemo } from "react";
import { Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { createDataTableColumnHelper, DataTable } from "@/components/shared/data-table";
import { DataTableSelectFilter } from "@/components/shared/data-table-select-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { useFormatFee } from "@/lib/use-format-fee";
import { DUE_SORTABLE_COLUMNS, DUE_STATUSES, type DueStatus } from "../filters";
import type { DueListItem, FeeClass } from "../queries";
import { DueActionsMenu } from "./due-actions-menu";

const column = createDataTableColumnHelper<DueListItem>();

const STATUS_VARIANTS = {
  paid: "success",
  partial: "warning",
  unpaid: "destructive",
} as const satisfies Record<DueStatus, string>;

type FeesTableProps = {
  dues: DueListItem[];
  rowCount: number;
  classes: FeeClass[];
};

export function FeesTable({ dues, rowCount, classes }: FeesTableProps) {
  const formatFee = useFormatFee();
  const t = useTranslations("fees");

  const columns = useMemo(
    () =>
      column.columns([
        column.accessor("admission_no", {
          header: t("columns.admissionNo"),
          cell: (info) => <span className="font-mono">{info.getValue()}</span>,
        }),
        column.accessor("full_name", {
          header: t("columns.name"),
          cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
        }),
        column.accessor("subject", {
          header: t("columns.class"),
          cell: (info) =>
            t("classValue", { subject: info.getValue(), grade: info.row.original.grade }),
        }),
        column.accessor("amount_due", {
          header: t("columns.due"),
          cell: (info) => formatFee(info.getValue()),
          meta: { align: "right" },
        }),
        column.accessor("paid_amount", {
          header: t("columns.paid"),
          cell: (info) => formatFee(info.getValue()),
          meta: { align: "right" },
        }),
        column.accessor("balance", {
          header: t("columns.balance"),
          cell: (info) => formatFee(info.getValue()),
          meta: { align: "right" },
        }),
        column.accessor("status", {
          header: t("columns.status"),
          cell: (info) => (
            <Badge variant={STATUS_VARIANTS[info.getValue()]}>
              {t(`status.${info.getValue()}`)}
            </Badge>
          ),
        }),
        column.display({
          id: "actions",
          header: () => <span className="sr-only">{t("actions.column")}</span>,
          cell: (info) => <DueActionsMenu due={info.row.original} />,
          meta: { align: "right" },
        }),
      ]),
    [t, formatFee],
  );

  const classOptions = classes.map((klass) => ({
    value: klass.id,
    label: t("classValue", { subject: klass.subject, grade: klass.grade }),
  }));

  const statusOptions = DUE_STATUSES.map((status) => ({
    value: status,
    label: t(`status.${status}`),
  }));

  return (
    <DataTable
      label={t("metaTitle")}
      columns={columns}
      data={dues}
      rowCount={rowCount}
      sortableColumns={DUE_SORTABLE_COLUMNS}
      searchPlaceholder={t("searchPlaceholder")}
      filters={
        <>
          <DataTableSelectFilter
            param="class"
            label={t("filters.class")}
            defaultLabel={t("filters.allClasses")}
            options={classOptions}
          />
          <DataTableSelectFilter
            param="status"
            label={t("filters.status")}
            defaultLabel={t("filters.allStatuses")}
            options={statusOptions}
          />
        </>
      }
      getRowId={(due) => due.id}
      emptyState={
        <EmptyState
          icon={Wallet}
          title={t("empty.title")}
          description={t("empty.description")}
          className="rounded-none border-0 bg-transparent"
        />
      }
    />
  );
}

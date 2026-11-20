"use client";

import { useMemo } from "react";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { createDataTableColumnHelper, DataTable } from "@/components/shared/data-table";
import { DataTableSelectFilter } from "@/components/shared/data-table-select-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { STUDENT_GRADES, STUDENT_SORTABLE_COLUMNS, STUDENT_STATUSES } from "../filters";
import type { StudentListItem } from "../queries";

const column = createDataTableColumnHelper<StudentListItem>();

type StudentsTableProps = {
  students: StudentListItem[];
  rowCount: number;
};

export function StudentsTable({ students, rowCount }: StudentsTableProps) {
  const t = useTranslations();

  const columns = useMemo(
    () =>
      column.columns([
        column.accessor("admission_no", {
          header: t("students.columns.admissionNo"),
          cell: (info) => <span className="font-mono">{info.getValue()}</span>,
        }),
        column.accessor("full_name", {
          header: t("students.columns.name"),
          cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
        }),
        column.accessor("grade", { header: t("students.columns.grade") }),
        column.accessor("phone", {
          header: t("students.columns.phone"),
          cell: (info) => info.getValue() ?? t("students.notSet"),
        }),
        column.accessor("is_active", {
          header: t("students.columns.status"),
          cell: (info) =>
            info.getValue() ? (
              <Badge variant="success">{t("students.status.active")}</Badge>
            ) : (
              <Badge variant="neutral">{t("students.status.inactive")}</Badge>
            ),
        }),
      ]),
    [t],
  );

  const gradeOptions = STUDENT_GRADES.map((grade) => ({
    value: String(grade),
    label: t("students.filters.gradeOption", { grade }),
  }));

  const statusOptions = STUDENT_STATUSES.map((status) => ({
    value: status,
    label: t(`students.status.${status}`),
  }));

  return (
    <DataTable
      label={t("nav.students")}
      columns={columns}
      data={students}
      rowCount={rowCount}
      sortableColumns={STUDENT_SORTABLE_COLUMNS}
      searchPlaceholder={t("students.searchPlaceholder")}
      filters={
        <>
          <DataTableSelectFilter
            param="grade"
            label={t("students.filters.grade")}
            allLabel={t("students.filters.allGrades")}
            options={gradeOptions}
          />
          <DataTableSelectFilter
            param="status"
            label={t("students.filters.status")}
            allLabel={t("students.filters.allStatuses")}
            options={statusOptions}
          />
        </>
      }
      getRowId={(student) => student.id}
      emptyState={
        <EmptyState
          icon={Users}
          title={t("students.empty.title")}
          description={t("students.empty.description")}
          className="rounded-none border-0 bg-transparent"
        />
      }
    />
  );
}

"use client";

import { createDataTableColumnHelper, DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { DEMO_SORTABLE_COLUMNS, type DemoStudent } from "./sample-students";

const feeFormatter = new Intl.NumberFormat("en-LK", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const column = createDataTableColumnHelper<DemoStudent>();

const columns = column.columns([
  column.accessor("admissionNo", {
    header: "Admission no",
    cell: (info) => <span className="font-mono">{info.getValue()}</span>,
  }),
  column.accessor("name", {
    header: "Name",
    cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
  }),
  column.accessor("grade", { header: "Grade" }),
  column.accessor("phone", { header: "Phone" }),
  column.accessor("fee", {
    header: "Monthly fee",
    cell: (info) => `Rs. ${feeFormatter.format(info.getValue())}`,
    meta: { align: "right" },
  }),
  column.accessor("active", {
    header: "Status",
    cell: (info) =>
      info.getValue() ? (
        <Badge variant="success">Active</Badge>
      ) : (
        <Badge variant="neutral">Inactive</Badge>
      ),
  }),
]);

type StudentsTableProps = {
  students: DemoStudent[];
  rowCount: number;
};

export function StudentsTable({ students, rowCount }: StudentsTableProps) {
  return (
    <DataTable
      label="Students"
      columns={columns}
      data={students}
      rowCount={rowCount}
      sortableColumns={DEMO_SORTABLE_COLUMNS}
      searchPlaceholder="Search by name or admission no"
      getRowId={(student) => student.id}
    />
  );
}

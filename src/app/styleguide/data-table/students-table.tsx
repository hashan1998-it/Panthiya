"use client";

import { createDataTableColumnHelper, DataTable } from "@/components/shared/data-table";
import { DataTableSelectFilter } from "@/components/shared/data-table-select-filter";
import { Badge } from "@/components/ui/badge";
import { DEMO_GRADES, DEMO_SORTABLE_COLUMNS, type DemoStudent } from "./sample-students";

const feeFormatter = new Intl.NumberFormat("en-LK", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const GRADE_OPTIONS = DEMO_GRADES.map((grade) => ({
  value: String(grade),
  label: `Grade ${grade}`,
}));

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

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
      filters={
        <>
          <DataTableSelectFilter
            param="grade"
            label="Grade"
            allLabel="All grades"
            options={GRADE_OPTIONS}
          />
          <DataTableSelectFilter
            param="status"
            label="Status"
            allLabel="All"
            options={STATUS_OPTIONS}
          />
        </>
      }
      getRowId={(student) => student.id}
    />
  );
}

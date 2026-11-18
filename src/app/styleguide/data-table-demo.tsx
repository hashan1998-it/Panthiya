"use client";

import { createDataTableColumnHelper, DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";

export type DemoStudent = {
  id: string;
  admissionNo: string;
  name: string;
  grade: number;
  phone: string;
  fee: string;
  active: boolean;
};

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
  column.accessor("fee", { header: "Monthly fee", meta: { align: "right" } }),
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

export function DataTableDemo({ students }: { students: DemoStudent[] }) {
  return (
    <DataTable
      label="Students"
      columns={columns}
      data={students}
      getRowId={(student) => student.id}
    />
  );
}

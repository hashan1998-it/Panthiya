import type { NextRequest } from "next/server";
import { getTranslations } from "next-intl/server";
import { parseStudentFilters, STUDENT_SORTABLE_COLUMNS } from "@/features/students/filters";
import { listStudents } from "@/features/students/queries";
import { requireRole } from "@/lib/auth/require-role";
import { csvResponse, EXPORT_ROW_LIMIT, toCsv } from "@/lib/csv";
import { getToday } from "@/lib/dates";
import { parseTableParams } from "@/lib/table-params";

export async function GET(request: NextRequest) {
  await requireRole("admin");

  const raw = request.nextUrl.searchParams;
  const params = parseTableParams(raw, STUDENT_SORTABLE_COLUMNS);
  const [t, { students }] = await Promise.all([
    getTranslations("students"),
    listStudents({ ...params, page: 1, pageSize: EXPORT_ROW_LIMIT }, parseStudentFilters(raw)),
  ]);

  const csv = toCsv(
    [
      t("columns.admissionNo"),
      t("columns.name"),
      t("columns.grade"),
      t("columns.phone"),
      t("columns.status"),
    ],
    students.map((student) => [
      student.admission_no,
      student.full_name,
      student.grade,
      student.phone,
      student.is_active ? t("status.active") : t("status.inactive"),
    ]),
  );

  return csvResponse(csv, `students-${getToday()}.csv`);
}

import type { NextRequest } from "next/server";
import { getTranslations } from "next-intl/server";
import { getClassMonthAttendance } from "@/features/attendance/queries";
import { listMonthSessionDates } from "@/features/attendance/session-dates";
import { summarizeAttendanceOnDates } from "@/features/attendance/summary";
import { getClass } from "@/features/classes/queries";
import { requireRole } from "@/lib/auth/require-role";
import { csvResponse, toCsv } from "@/lib/csv";
import { getToday } from "@/lib/dates";
import { pickMonth } from "@/lib/months";
import { readParam } from "@/lib/table-params";

function toSlug(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "class"
  );
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");

  const { id } = await params;
  const klass = await getClass(id);
  if (!klass) return new Response(null, { status: 404 });

  const today = getToday();
  const month = pickMonth(readParam(request.nextUrl.searchParams, "month"), today);
  const dates = listMonthSessionDates(klass.day_of_week, month, today);
  const [t, rows] = await Promise.all([
    getTranslations("attendance.history"),
    dates.length > 0 ? getClassMonthAttendance(klass.id, month) : [],
  ]);

  const csv = toCsv(
    [t("student"), t("admissionNo"), ...dates, t("rate")],
    rows.map((row) => {
      const { rate } = summarizeAttendanceOnDates(row.marks, dates);

      return [
        row.full_name,
        row.admission_no,
        ...dates.map((date) => (row.marks[date] ? t(row.marks[date]) : t("notMarked"))),
        rate === null ? "" : `${Math.round(rate * 100)}%`,
      ];
    }),
  );

  return csvResponse(
    csv,
    `attendance-${toSlug(`${klass.subject}-grade-${klass.grade}`)}-${month}.csv`,
  );
}

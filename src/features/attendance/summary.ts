import type { Enums } from "@/types/database";

export type AttendanceStatus = Enums<"attendance_status">;

export type AttendanceSummary = {
  present: number;
  late: number;
  absent: number;
  total: number;
  rate: number | null;
};

export function summarizeAttendance(
  rows: readonly { status: AttendanceStatus }[],
): AttendanceSummary {
  const counts = { present: 0, late: 0, absent: 0 };
  for (const row of rows) counts[row.status] += 1;

  const total = counts.present + counts.late + counts.absent;
  const rate = total === 0 ? null : (counts.present + counts.late) / total;

  return { ...counts, total, rate };
}

export function summarizeAttendanceByClass(
  rows: readonly { class_id: string; status: AttendanceStatus }[],
): Map<string, AttendanceSummary> {
  const rowsByClass = Map.groupBy(rows, (row) => row.class_id);

  return new Map(
    [...rowsByClass].map(([classId, classRows]) => [classId, summarizeAttendance(classRows)]),
  );
}

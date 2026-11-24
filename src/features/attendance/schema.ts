import type { Messages } from "next-intl";
import { z } from "zod";
import { Constants } from "@/types/database";

export type AttendanceErrorKey = keyof Messages["attendance"]["errors"];
const error = (key: AttendanceErrorKey) => ({ error: key });

export const ATTENDANCE_STATUSES = Constants.public.Enums.attendance_status;

export const attendanceSchema = z.object({
  class_id: z.guid(error("notFound")),
  session_date: z.iso.date(error("invalidDate")),
  marks: z
    .array(
      z.object({
        student_id: z.guid(),
        status: z.enum(ATTENDANCE_STATUSES),
      }),
    )
    .min(1, error("noMarks"))
    .refine(
      (marks) => new Set(marks.map((mark) => mark.student_id)).size === marks.length,
      error("saveFailed"),
    ),
});

export type AttendanceValues = z.input<typeof attendanceSchema>;
export type AttendanceInput = z.output<typeof attendanceSchema>;

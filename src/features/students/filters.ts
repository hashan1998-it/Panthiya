import { z } from "zod";
import { readParam, type RawSearchParams } from "@/lib/table-params";

export const STUDENT_SORTABLE_COLUMNS = ["admission_no", "full_name", "grade"] as const;

export const STUDENT_GRADES = Array.from({ length: 13 }, (_, index) => index + 1);

export const STUDENT_STATUS_FILTERS = ["active", "inactive", "all"] as const;

export type StudentStatusFilter = (typeof STUDENT_STATUS_FILTERS)[number];

export const DEFAULT_STUDENT_STATUS: StudentStatusFilter = "active";

export type StudentFilters = {
  grade: number | null;
  status: StudentStatusFilter;
};

// Anything missing or invalid in the URL becomes `null`, which means "no filter".
const gradeSchema = z.coerce.number().int().min(1).max(13).nullable().catch(null);
const statusSchema = z.enum(STUDENT_STATUS_FILTERS).catch(DEFAULT_STUDENT_STATUS);

export function parseStudentFilters(raw: RawSearchParams): StudentFilters {
  return {
    grade: gradeSchema.parse(readParam(raw, "grade")),
    status: statusSchema.parse(readParam(raw, "status")),
  };
}

import { z } from "zod";
import { readParam, type RawSearchParams } from "@/lib/table-params";
import { Constants } from "@/types/database";

export const DUE_SORTABLE_COLUMNS = ["admission_no", "full_name", "subject", "balance"] as const;

export const DUE_STATUSES = Constants.public.Enums.due_status;

export type DueStatus = (typeof DUE_STATUSES)[number];

export type DueFilters = {
  classId: string | null;
  status: DueStatus | null;
};

const classSchema = z.guid().nullable().catch(null);
const statusSchema = z.enum(DUE_STATUSES).nullable().catch(null);

export function parseDueFilters(raw: RawSearchParams): DueFilters {
  return {
    classId: classSchema.parse(readParam(raw, "class") ?? null),
    status: statusSchema.parse(readParam(raw, "status") ?? null),
  };
}

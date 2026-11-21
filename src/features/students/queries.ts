import { cache } from "react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { toContainsPattern } from "@/lib/search";
import { getPageInfo, type TableParams } from "@/lib/table-params";
import type { Tables } from "@/types/database";
import { STUDENT_SORTABLE_COLUMNS, type StudentFilters } from "./filters";

type StudentSortColumn = (typeof STUDENT_SORTABLE_COLUMNS)[number];

export type StudentListItem = Pick<
  Tables<"students">,
  "id" | "admission_no" | "full_name" | "grade" | "phone" | "is_active"
>;

export type StudentList = {
  students: StudentListItem[];
  rowCount: number;
};

export type StudentDetail = Omit<Tables<"students">, "created_at" | "profile_id">;

const LIST_COLUMNS = "id, admission_no, full_name, grade, phone, is_active";
const DETAIL_COLUMNS =
  "id, admission_no, full_name, grade, phone, parent_name, parent_phone, joined_on, is_active";
const RANGE_NOT_SATISFIABLE = "PGRST103";

export async function listStudents(
  params: TableParams,
  filters: StudentFilters,
): Promise<StudentList> {
  const supabase = await createClient();
  const sortColumn = (params.sort?.id ?? "admission_no") as StudentSortColumn;
  const ascending = !params.sort?.desc;

  function buildQuery({ head = false } = {}) {
    let query = supabase.from("students").select(LIST_COLUMNS, { count: "exact", head });

    if (params.q) {
      const pattern = toContainsPattern(params.q);
      query = query.or(`full_name.ilike.${pattern},admission_no.ilike.${pattern}`);
    }
    if (filters.grade !== null) {
      query = query.eq("grade", filters.grade);
    }
    if (filters.status !== "all") {
      query = query.eq("is_active", filters.status === "active");
    }

    return query;
  }

  function fetchPage(page: number) {
    const offset = (page - 1) * params.pageSize;
    let query = buildQuery().order(sortColumn, { ascending });

    if (sortColumn !== "admission_no") {
      query = query.order("admission_no", { ascending: true });
    }

    return query.range(offset, offset + params.pageSize - 1);
  }

  let result = await fetchPage(params.page);

  if (result.error?.code === RANGE_NOT_SATISFIABLE) {
    const { count, error } = await buildQuery({ head: true });
    if (error) throw error;

    const { page } = getPageInfo(count ?? 0, params.page, params.pageSize);
    result = await fetchPage(page);
  }

  if (result.error) throw result.error;

  return { students: result.data, rowCount: result.count ?? 0 };
}

export const getStudent = cache(async (id: string): Promise<StudentDetail | null> => {
  if (!z.guid().safeParse(id).success) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select(DETAIL_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data;
});

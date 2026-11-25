import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { toContainsPattern } from "@/lib/search";
import { getPageInfo, type TableParams } from "@/lib/table-params";
import type { Tables } from "@/types/database";
import { DUE_SORTABLE_COLUMNS, type DueFilters, type DueStatus } from "./filters";
import { summarizeOutstanding, type StudentOutstanding } from "./outstanding";
import { getMonthBounds } from "./schema";

type DueSortColumn = (typeof DUE_SORTABLE_COLUMNS)[number];

export type FeeClass = Pick<Tables<"classes">, "id" | "subject" | "grade">;

export type DueListItem = {
  id: string;
  student_id: string;
  admission_no: string;
  full_name: string;
  subject: string;
  grade: number;
  amount_due: number;
  paid_amount: number;
  balance: number;
  status: DueStatus;
};

export type DueList = {
  dues: DueListItem[];
  rowCount: number;
};

export type FeesTotals = {
  count: number;
  due: number;
  collected: number;
  outstanding: number;
};

type TotalsRow = Pick<Tables<"due_balances">, "amount_due" | "paid_amount" | "balance">;

const LIST_COLUMNS =
  "id, student_id, admission_no, full_name, subject, grade, amount_due, paid_amount, balance, status";
const RANGE_NOT_SATISFIABLE = "PGRST103";

function toCents(amount: number | null) {
  return Math.round((amount ?? 0) * 100);
}

export type Receipt = Pick<
  Tables<"payments">,
  "id" | "receipt_no" | "amount" | "paid_on" | "method" | "voided_at"
> & {
  month: string;
  student: Pick<Tables<"students">, "admission_no" | "full_name">;
  class: Pick<Tables<"classes">, "subject" | "grade">;
};

export async function getReceipt(paymentId: string): Promise<Receipt | null> {
  if (!z.guid().safeParse(paymentId).success) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select(
      "id, receipt_no, amount, paid_on, method, voided_at, due:dues!inner(month, enrollment:enrollments!inner(student:students!inner(admission_no, full_name), class:classes!inner(subject, grade)))",
    )
    .eq("id", paymentId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { due, ...payment } = data;

  return {
    ...payment,
    month: due.month.slice(0, 7),
    student: due.enrollment.student,
    class: due.enrollment.class,
  };
}

export async function listStudentsOutstanding(today: string): Promise<StudentOutstanding[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("due_balances")
    .select("student_id, admission_no, full_name, month, subject, grade, balance")
    .gt("balance", 0)
    .lte("month", getMonthBounds(today.slice(0, 7)).first);

  if (error) throw error;

  return summarizeOutstanding(data.map((due) => ({ ...due, balance: due.balance ?? 0 })));
}

export async function listFeeClasses(): Promise<FeeClass[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select("id, subject, grade")
    .order("subject")
    .order("grade");

  if (error) throw error;
  return data;
}

export async function listDues(
  month: string,
  params: TableParams,
  filters: DueFilters,
): Promise<DueList> {
  const supabase = await createClient();
  const sortColumn = (params.sort?.id ?? "full_name") as DueSortColumn;
  const ascending = !params.sort?.desc;

  function buildQuery({ head = false } = {}) {
    let query = supabase
      .from("due_balances")
      .select(LIST_COLUMNS, { count: "exact", head })
      .eq("month", getMonthBounds(month).first);

    if (params.q) {
      const pattern = toContainsPattern(params.q);
      query = query.or(`full_name.ilike.${pattern},admission_no.ilike.${pattern}`);
    }
    if (filters.classId) {
      query = query.eq("class_id", filters.classId);
    }
    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    return query;
  }

  function fetchPage(page: number) {
    const offset = (page - 1) * params.pageSize;

    return buildQuery()
      .order(sortColumn, { ascending })
      .order("full_name", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + params.pageSize - 1);
  }

  let result = await fetchPage(params.page);

  if (result.error?.code === RANGE_NOT_SATISFIABLE) {
    const { count, error } = await buildQuery({ head: true });
    if (error) throw error;

    const { page } = getPageInfo(count ?? 0, params.page, params.pageSize);
    result = await fetchPage(page);
  }

  if (result.error) throw result.error;

  const dues = result.data.map((due) => ({
    ...due,
    paid_amount: due.paid_amount ?? 0,
    balance: due.balance ?? 0,
    status: due.status ?? "unpaid",
  }));

  return { dues, rowCount: result.count ?? 0 };
}

export async function getFeesTotals(month: string, classId: string | null): Promise<FeesTotals> {
  const supabase = await createClient();
  let query = supabase
    .from("due_balances")
    .select("amount_due, paid_amount, balance")
    .eq("month", getMonthBounds(month).first);

  if (classId) {
    query = query.eq("class_id", classId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const sum = (pick: (due: TotalsRow) => number | null) =>
    data.reduce((total, due) => total + toCents(pick(due)), 0) / 100;

  return {
    count: data.length,
    due: sum((due) => due.amount_due),
    collected: sum((due) => due.paid_amount),
    outstanding: sum((due) => due.balance),
  };
}

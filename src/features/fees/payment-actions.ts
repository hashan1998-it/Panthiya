"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/require-role";
import { getToday } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import {
  paymentSchema,
  voidPaymentSchema,
  type PaymentErrorKey,
  type PaymentFormValues,
} from "./payment-schema";

const FORM_ERROR_KEYS = [
  "amountRequired",
  "amountInvalid",
  "amountPositive",
  "amountTooHigh",
  "dateInvalid",
  "dateInFuture",
  "methodRequired",
] as const satisfies readonly PaymentErrorKey[];

export type RecordPaymentResult =
  { ok: true; receiptNo: string } | { ok: false; error: PaymentErrorKey };

export type VoidPaymentResult = { ok: true; receiptNo: string } | { ok: false };

export async function recordPayment(values: PaymentFormValues): Promise<RecordPaymentResult> {
  await requireRole("admin");

  if (!z.guid().safeParse(values.due_id).success) return { ok: false, error: "notFound" };

  const supabase = await createClient();
  const { data: due, error: dueError } = await supabase
    .from("due_balances")
    .select("id, student_id, balance")
    .eq("id", values.due_id)
    .maybeSingle();

  if (dueError) return { ok: false, error: "saveFailed" };
  if (!due) return { ok: false, error: "notFound" };

  const balance = due.balance ?? 0;
  if (balance <= 0) return { ok: false, error: "alreadyPaid" };

  const result = paymentSchema({ balance, today: getToday() }).safeParse(values);
  if (!result.success) {
    const message = result.error.issues[0].message;
    const error = FORM_ERROR_KEYS.find((key) => key === message) ?? "saveFailed";
    return { ok: false, error };
  }

  const { data: payment, error } = await supabase
    .from("payments")
    .insert(result.data)
    .select("receipt_no")
    .single();

  if (error) return { ok: false, error: "saveFailed" };

  revalidatePath("/fees");
  revalidatePath(`/students/${due.student_id}`);

  return { ok: true, receiptNo: payment.receipt_no };
}

export async function voidPayment(paymentId: string): Promise<VoidPaymentResult> {
  await requireRole("admin");

  const result = voidPaymentSchema.safeParse({ payment_id: paymentId });
  if (!result.success) return { ok: false };

  const supabase = await createClient();
  const { data: payment, error } = await supabase
    .from("payments")
    .update({ voided_at: new Date().toISOString() })
    .eq("id", result.data.payment_id)
    .is("voided_at", null)
    .select("receipt_no, due:dues!inner(enrollment:enrollments!inner(student_id))")
    .maybeSingle();

  if (error || !payment) return { ok: false };

  revalidatePath("/fees");
  revalidatePath(`/students/${payment.due.enrollment.student_id}`);

  return { ok: true, receiptNo: payment.receipt_no };
}

import type { Messages } from "next-intl";
import { z } from "zod";
import { Constants } from "@/types/database";

export type PaymentErrorKey = keyof Messages["fees"]["payment"]["errors"];
const error = (key: PaymentErrorKey) => ({ error: key });

export const PAYMENT_METHODS = Constants.public.Enums.payment_method;

export function paymentSchema({ balance, today }: { balance: number; today: string }) {
  return z.object({
    due_id: z.guid(error("notFound")),
    amount: z
      .string()
      .trim()
      .transform((value) => value.replaceAll(",", ""))
      .pipe(
        z
          .string()
          .min(1, { ...error("amountRequired"), abort: true })
          .regex(/^\d{1,8}(\.\d{1,2})?$/, error("amountInvalid"))
          .transform(Number)
          .pipe(z.number().positive(error("amountPositive")).max(balance, error("amountTooHigh"))),
      ),
    paid_on: z.iso
      .date(error("dateInvalid"))
      .refine((date) => date <= today, error("dateInFuture")),
    method: z.enum(PAYMENT_METHODS, error("methodRequired")),
  });
}

export type PaymentFormValues = z.input<ReturnType<typeof paymentSchema>>;
export type PaymentInput = z.output<ReturnType<typeof paymentSchema>>;

export const voidPaymentSchema = z.object({ payment_id: z.guid() });

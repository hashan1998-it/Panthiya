"use client";

import { type ReactNode, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { getToday } from "@/lib/dates";
import { useFormatFee } from "@/lib/use-format-fee";
import { recordPayment } from "../payment-actions";
import {
  PAYMENT_METHODS,
  paymentSchema,
  type PaymentErrorKey,
  type PaymentFormValues,
  type PaymentInput,
} from "../payment-schema";
import type { DueListItem } from "../queries";

type FieldName = Exclude<keyof PaymentFormValues, "due_id">;

const FIELD_FOR_ERROR: Partial<Record<PaymentErrorKey, FieldName>> = {
  amountRequired: "amount",
  amountInvalid: "amount",
  amountPositive: "amount",
  amountTooHigh: "amount",
  dateInvalid: "paid_on",
  dateInFuture: "paid_on",
  methodRequired: "method",
};

type RecordPaymentDialogProps = {
  due: DueListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RecordPaymentDialog({ due, open, onOpenChange }: RecordPaymentDialogProps) {
  const formatFee = useFormatFee();
  const t = useTranslations("fees");
  const [pending, setPending] = useState(false);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!pending) onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("payment.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("payment.description", {
              name: due.full_name,
              className: t("classValue", { subject: due.subject, grade: due.grade }),
              balance: formatFee(due.balance),
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <RecordPaymentForm
          due={due}
          onPendingChange={setPending}
          onDone={() => onOpenChange(false)}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

type RecordPaymentFormProps = {
  due: DueListItem;
  onPendingChange: (pending: boolean) => void;
  onDone: () => void;
};

function RecordPaymentForm({ due, onPendingChange, onDone }: RecordPaymentFormProps) {
  const t = useTranslations("fees.payment");
  const tCommon = useTranslations("common");
  const [today] = useState(getToday);
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<PaymentErrorKey>();

  const {
    formState: { errors },
    register,
    handleSubmit,
    getValues,
    setError,
  } = useForm<PaymentFormValues, unknown, PaymentInput>({
    resolver: zodResolver(paymentSchema({ balance: due.balance, today })),
    mode: "onTouched",
    defaultValues: {
      due_id: due.id,
      amount: due.balance.toFixed(2),
      paid_on: today,
      method: "cash",
    },
  });

  const errorText = (name: FieldName) => {
    const key = errors[name]?.message;
    return key ? t(`errors.${key as PaymentErrorKey}`) : undefined;
  };

  const onValid = () => {
    setFormError(undefined);
    onPendingChange(true);

    startTransition(async () => {
      const result = await recordPayment(getValues());
      onPendingChange(false);

      if (!result.ok) {
        const field = FIELD_FOR_ERROR[result.error];
        if (field) {
          setError(field, { message: result.error }, { shouldFocus: true });
        } else {
          setFormError(result.error);
        }
        return;
      }

      toast.success(t("recorded", { receiptNo: result.receiptNo }));
      onDone();
    });
  };

  const field = (name: FieldName, label: "amount" | "paidOn" | "method", control: ReactNode) => {
    const error = errorText(name);

    return (
      <Field data-invalid={!!error}>
        <FieldLabel htmlFor={`payment-${name}`}>{t(`fields.${label}`)}</FieldLabel>
        {control}
        <FieldError>{error}</FieldError>
      </Field>
    );
  };

  const inputProps = (name: FieldName) => ({
    id: `payment-${name}`,
    "aria-invalid": !!errors[name],
    ...register(name),
  });

  return (
    <form noValidate className="flex flex-col gap-6" onSubmit={handleSubmit(onValid)}>
      <FieldGroup className="grid gap-4 sm:grid-cols-2">
        {field(
          "amount",
          "amount",
          <Input type="text" inputMode="decimal" {...inputProps("amount")} />,
        )}
        {field("paid_on", "paidOn", <Input type="date" max={today} {...inputProps("paid_on")} />)}
        {field(
          "method",
          "method",
          <NativeSelect className="w-full" {...inputProps("method")}>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {t(`methods.${method}`)}
              </option>
            ))}
          </NativeSelect>,
        )}
      </FieldGroup>
      {formError && (
        <p role="alert" className="text-body-sm text-destructive-foreground">
          {t(`errors.${formError}`)}
        </p>
      )}
      <AlertDialogFooter>
        <AlertDialogCancel disabled={pending}>{tCommon("cancel")}</AlertDialogCancel>
        <Button type="submit" disabled={pending}>
          {pending ? t("pending") : t("submit")}
        </Button>
      </AlertDialogFooter>
    </form>
  );
}

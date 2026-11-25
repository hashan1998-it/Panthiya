"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatFee } from "@/lib/money";
import { listDuePayments, voidPayment, type DuePayment } from "../payment-actions";
import type { DueListItem } from "../queries";

type DuePaymentsDialogProps = {
  due: DueListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DuePaymentsDialog({ due, open, onOpenChange }: DuePaymentsDialogProps) {
  const t = useTranslations("fees");
  const tCommon = useTranslations("common");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("payments.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("payments.description", {
              name: due.full_name,
              className: t("classValue", { subject: due.subject, grade: due.grade }),
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <PaymentsList dueId={due.id} />
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon("close")}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type ListState =
  { status: "loading" } | { status: "failed" } | { status: "ready"; payments: DuePayment[] };

function PaymentsList({ dueId }: { dueId: string }) {
  const t = useTranslations("fees");
  const format = useFormatter();
  const [state, setState] = useState<ListState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    listDuePayments(dueId).then((result) => {
      if (!active) return;
      setState(result.ok ? { status: "ready", payments: result.payments } : { status: "failed" });
    });

    return () => {
      active = false;
    };
  }, [dueId]);

  if (state.status !== "ready") {
    return (
      <p
        role={state.status === "failed" ? "alert" : "status"}
        className="py-4 text-body-sm text-muted-foreground"
      >
        {state.status === "failed" ? t("payments.loadFailed") : t("payments.loading")}
      </p>
    );
  }

  if (state.payments.length === 0) {
    return <p className="py-4 text-body-sm text-muted-foreground">{t("payments.empty")}</p>;
  }

  const onVoided = (payment: DuePayment) => {
    setState({
      status: "ready",
      payments: state.payments.map((item) =>
        item.id === payment.id ? { ...item, voided_at: new Date().toISOString() } : item,
      ),
    });
  };

  return (
    <ul
      aria-label={t("payments.listLabel")}
      className="divide-y divide-border border-y border-border"
    >
      {state.payments.map((payment) => (
        <li key={payment.id} className="flex items-center gap-3 py-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center gap-2 text-body-sm text-foreground">
              <span className="font-mono">{payment.receipt_no}</span>
              {payment.voided_at && <Badge variant="neutral">{t("payments.voided")}</Badge>}
            </span>
            <span className="text-caption text-muted-foreground">
              {t("payments.summary", {
                date: format.dateTime(new Date(`${payment.paid_on}T00:00:00Z`), {
                  dateStyle: "medium",
                  timeZone: "UTC",
                }),
                method: t(`payment.methods.${payment.method}`),
              })}
            </span>
          </div>
          <span
            className={
              payment.voided_at
                ? "text-body-sm text-muted-foreground tabular-nums line-through"
                : "text-body-sm text-foreground tabular-nums"
            }
          >
            {formatFee(payment.amount)}
          </span>
          {!payment.voided_at && <VoidPaymentButton payment={payment} onVoided={onVoided} />}
        </li>
      ))}
    </ul>
  );
}

type VoidPaymentButtonProps = {
  payment: DuePayment;
  onVoided: (payment: DuePayment) => void;
};

function VoidPaymentButton({ payment, onVoided }: VoidPaymentButtonProps) {
  const t = useTranslations("fees.payments.void");

  const onConfirm = async () => {
    const result = await voidPayment(payment.id);

    if (!result.ok) {
      toast.error(t("failed"));
      return false;
    }

    toast.success(t("done", { receiptNo: result.receiptNo }));
    onVoided(payment);
  };

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="outline"
          size="sm"
          aria-label={t("label", { receiptNo: payment.receipt_no })}
        >
          {t("action")}
        </Button>
      }
      title={t("title", { receiptNo: payment.receipt_no })}
      description={t("description", { amount: formatFee(payment.amount) })}
      confirmLabel={t("action")}
      pendingLabel={t("pending")}
      destructive
      onConfirm={onConfirm}
    />
  );
}

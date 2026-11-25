"use client";

import { useState } from "react";
import { HandCoins, MoreHorizontal, ReceiptText } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DueListItem } from "../queries";
import { DuePaymentsDialog } from "./due-payments-dialog";
import { RecordPaymentDialog } from "./record-payment-dialog";

export function DueActionsMenu({ due }: { due: DueListItem }) {
  const t = useTranslations("fees");
  const [recordOpen, setRecordOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" />}
          aria-label={t("actions.menu", { name: due.full_name })}
        >
          <MoreHorizontal aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem disabled={due.balance <= 0} onClick={() => setRecordOpen(true)}>
            <HandCoins aria-hidden />
            {t("payment.record")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPaymentsOpen(true)}>
            <ReceiptText aria-hidden />
            {t("payments.action")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <RecordPaymentDialog due={due} open={recordOpen} onOpenChange={setRecordOpen} />
      <DuePaymentsDialog due={due} open={paymentsOpen} onOpenChange={setPaymentsOpen} />
    </>
  );
}

"use client";

import { CalendarPlus } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { generateDues } from "../actions";

export function GenerateDuesButton({ month }: { month: string }) {
  const t = useTranslations("fees.generate");
  const tErrors = useTranslations("fees.errors");
  const format = useFormatter();

  const monthLabel = format.dateTime(new Date(`${month}-01T00:00:00Z`), {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const onConfirm = async () => {
    const result = await generateDues({ month });

    if (!result.ok) {
      toast.error(tErrors(result.error));
      return false;
    }

    if (result.created > 0) {
      toast.success(t("created", { count: result.created, month: monthLabel }));
    } else if (result.total > 0) {
      toast.info(t("upToDate", { month: monthLabel }));
    } else {
      toast.info(t("noEnrollments", { month: monthLabel }));
    }
  };

  return (
    <ConfirmDialog
      trigger={
        <Button>
          <CalendarPlus aria-hidden />
          {t("action")}
        </Button>
      }
      title={t("title", { month: monthLabel })}
      description={t("description", { month: monthLabel })}
      confirmLabel={t("action")}
      pendingLabel={t("pending")}
      onConfirm={onConfirm}
    />
  );
}

"use client";

import type { ReactElement } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { setStudentActive } from "../actions";

type StudentStatusDialogProps = {
  studentId: string;
  fullName: string;
  isActive: boolean;
  trigger?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function StudentStatusDialog({
  studentId,
  fullName,
  isActive,
  trigger,
  open,
  onOpenChange,
}: StudentStatusDialogProps) {
  const t = useTranslations("students.profile");
  const dialog = isActive ? "deactivateDialog" : "reactivateDialog";

  const onConfirm = async () => {
    const result = await setStudentActive(studentId, !isActive);

    if (!result.ok) {
      toast.error(t("statusFailed"));
      return false;
    }

    toast.success(
      isActive
        ? t("deactivated", { name: result.fullName })
        : t("reactivated", { name: result.fullName }),
    );
  };

  return (
    <ConfirmDialog
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      title={t(`${dialog}.title`, { name: fullName })}
      description={t(`${dialog}.description`)}
      confirmLabel={isActive ? t("deactivate") : t("reactivate")}
      pendingLabel={t(`${dialog}.pending`)}
      destructive={isActive}
      onConfirm={onConfirm}
    />
  );
}

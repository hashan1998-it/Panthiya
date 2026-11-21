"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { setStudentActive } from "../actions";

type StudentStatusButtonProps = {
  studentId: string;
  fullName: string;
  isActive: boolean;
};

export function StudentStatusButton({ studentId, fullName, isActive }: StudentStatusButtonProps) {
  const t = useTranslations("students.profile");
  const dialog = isActive ? "deactivateDialog" : "reactivateDialog";
  const label = isActive ? t("deactivate") : t("reactivate");

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
      trigger={<Button variant="outline">{label}</Button>}
      title={t(`${dialog}.title`, { name: fullName })}
      description={t(`${dialog}.description`)}
      confirmLabel={label}
      pendingLabel={t(`${dialog}.pending`)}
      destructive={isActive}
      onConfirm={onConfirm}
    />
  );
}

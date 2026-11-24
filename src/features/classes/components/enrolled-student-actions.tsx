"use client";

import { useState } from "react";
import { UserMinus } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { StudentActionsMenu } from "@/features/students/components/student-actions-menu";
import { unenrollStudent } from "../enrollment-actions";
import type { ClassEnrollment } from "../queries";

type EnrolledStudentActionsProps = {
  enrollmentId: string;
  student: ClassEnrollment["student"];
  className: string;
};

export function EnrolledStudentActions({
  enrollmentId,
  student,
  className,
}: EnrolledStudentActionsProps) {
  const t = useTranslations("classes.unenroll");
  const [open, setOpen] = useState(false);

  const onConfirm = async () => {
    const result = await unenrollStudent(enrollmentId);

    if (!result.ok) {
      toast.error(t("failed"));
      return false;
    }

    toast.success(t("done", { name: result.fullName }));
  };

  return (
    <>
      <StudentActionsMenu
        student={student}
        extraItems={
          <DropdownMenuItem variant="destructive" onClick={() => setOpen(true)}>
            <UserMinus aria-hidden />
            {t("action")}
          </DropdownMenuItem>
        }
      />
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t("title", { name: student.full_name, className })}
        description={t("description")}
        confirmLabel={t("action")}
        pendingLabel={t("pending")}
        destructive
        onConfirm={onConfirm}
      />
    </>
  );
}

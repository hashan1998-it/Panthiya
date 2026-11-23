"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, MoreHorizontal, Pencil, UserCheck, UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StudentListItem } from "../queries";
import { StudentStatusDialog } from "./student-status-dialog";

type StudentActionsMenuProps = {
  student: Pick<StudentListItem, "id" | "full_name" | "is_active">;
};

export function StudentActionsMenu({ student }: StudentActionsMenuProps) {
  const t = useTranslations("students");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const profileHref = `/students/${student.id}`;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" />}
          aria-label={t("actions.menu", { name: student.full_name })}
        >
          <MoreHorizontal aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem render={<Link href={profileHref} />}>
            <Eye aria-hidden />
            {t("actions.viewProfile")}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={`${profileHref}/edit`} />}>
            <Pencil aria-hidden />
            {t("profile.edit")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant={student.is_active ? "destructive" : "default"}
            onClick={() => setStatusDialogOpen(true)}
          >
            {student.is_active ? <UserX aria-hidden /> : <UserCheck aria-hidden />}
            {student.is_active ? t("profile.deactivate") : t("profile.reactivate")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <StudentStatusDialog
        studentId={student.id}
        fullName={student.full_name}
        isActive={student.is_active}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
      />
    </>
  );
}

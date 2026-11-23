"use client";

import Link from "next/link";
import { Eye, MoreHorizontal, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ClassActionsMenuProps = {
  classId: string;
  name: string;
};

export function ClassActionsMenu({ classId, name }: ClassActionsMenuProps) {
  const t = useTranslations("classes");
  const classHref = `/classes/${classId}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" />}
        aria-label={t("actions.menu", { name })}
      >
        <MoreHorizontal aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem render={<Link href={classHref} />}>
          <Eye aria-hidden />
          {t("actions.view")}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={`${classHref}/edit`} />}>
          <Pencil aria-hidden />
          {t("detail.edit")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

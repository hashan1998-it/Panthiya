"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSignOut } from "@/app/(auth)/components/use-sign-out";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

type UserMenuProps = {
  fullName: string;
};

export function UserMenu({ fullName }: UserMenuProps) {
  const t = useTranslations();
  const { signOut, busy } = useSignOut();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="h-10 gap-2 px-2" />}>
        <Avatar aria-hidden>
          <AvatarFallback className="text-caption">{getInitials(fullName)}</AvatarFallback>
        </Avatar>
        <span className="sr-only text-body-sm font-medium sm:not-sr-only sm:max-w-40 sm:truncate">
          {t.rich("nav.accountMenu", {
            name: fullName,
            hidden: (chunks) => <span className="sr-only">{chunks}</span>,
          })}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">{fullName}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/settings" />}>
          <Settings aria-hidden />
          {t("nav.settings")}
        </DropdownMenuItem>
        <DropdownMenuItem closeOnClick={false} disabled={busy} onClick={signOut}>
          <LogOut aria-hidden />
          {busy ? t("auth.signOut.signingOut") : t("auth.signOut.logOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

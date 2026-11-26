"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { LogoWordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NavList } from "./nav-list";

export function MobileNav() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="size-10 md:hidden" />}
        aria-label={t("nav.openMenu")}
      >
        <Menu className="size-5" aria-hidden />
      </SheetTrigger>
      <SheetContent side="left" className="w-60 gap-0 bg-sidebar text-sidebar-foreground">
        <div className="flex h-14 shrink-0 items-center px-6">
          <SheetTitle>
            <LogoWordmark className="h-6 w-auto" />
            <span className="sr-only">{t("metadata.title")}</span>
          </SheetTitle>
        </div>
        <nav aria-label={t("nav.mainLabel")} className="flex-1 overflow-y-auto px-3 py-4">
          <NavList variant="drawer" onNavigate={() => setOpen(false)} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}

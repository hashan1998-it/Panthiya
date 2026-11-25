"use client";

import { useTransition } from "react";
import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALES, toLocale } from "@/lib/locale";
import { setLocale } from "@/lib/locale-actions";

export function LanguageSwitch() {
  const t = useTranslations("common.language");
  const locale = toLocale(useLocale());
  const [pending, startTransition] = useTransition();

  const onChange = (value: string) => {
    if (value === locale) return;

    startTransition(async () => {
      const result = await setLocale(value);
      if (!result.ok) toast.error(t("failed"));
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" disabled={pending} />}
        aria-label={t("label", { language: t(locale) })}
      >
        <Languages aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("title")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={locale} onValueChange={onChange}>
            {LOCALES.map((value) => (
              <DropdownMenuRadioItem key={value} value={value} lang={value}>
                {t(value)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

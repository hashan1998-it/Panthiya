"use client";

import { useSyncExternalStore, useTransition } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { LOCALES, toLocale, type AppLocale } from "@/lib/locale";
import { setLocale } from "@/lib/locale-actions";

const THEMES = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
] as const;

const subscribe = () => () => {};

export function LanguageControl({ label }: { label: string }) {
  const t = useTranslations("common.language");
  const locale = toLocale(useLocale());
  const [pending, startTransition] = useTransition();

  return (
    <SegmentedControl<AppLocale>
      aria-label={label}
      value={locale}
      disabled={pending}
      onValueChange={(value) => {
        if (!value || value === locale) return;
        startTransition(async () => {
          const result = await setLocale(value);
          if (!result.ok) toast.error(t("failed"));
        });
      }}
    >
      {LOCALES.map((value) => (
        <SegmentedControlItem key={value} value={value} lang={value}>
          {t(value)}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}

export function ThemeControl({ label }: { label: string }) {
  const t = useTranslations("common.theme");
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  if (!mounted) return <Skeleton className="h-11 w-72 max-w-full rounded-full" />;

  return (
    <SegmentedControl<string>
      aria-label={label}
      value={theme ?? "system"}
      onValueChange={(value) => value && setTheme(value)}
    >
      {THEMES.map(({ value, icon: Icon }) => (
        <SegmentedControlItem key={value} value={value}>
          <Icon aria-hidden />
          {t(value)}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { NativeSelect } from "@/components/ui/native-select";
import type { Option } from "@/lib/get-date-labels";

type MonthPickerProps = {
  id: string;
  month: string;
  options: Option[];
  params?: Record<string, string>;
};

export function MonthPicker({ id, month, options, params: extraParams }: MonthPickerProps) {
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (nextMonth: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("month", nextMonth);
    for (const [key, value] of Object.entries(extraParams ?? {})) params.set(key, value);
    router.replace(`${pathname}?${params}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-body-sm text-muted-foreground">
        {t("month")}
      </label>
      <NativeSelect id={id} value={month} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}

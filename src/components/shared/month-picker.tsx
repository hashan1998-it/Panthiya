"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { NativeSelect } from "@/components/ui/native-select";

type MonthPickerProps = {
  id: string;
  month: string;
  months: string[];
  params?: Record<string, string>;
};

export function MonthPicker({ id, month, months, params: extraParams }: MonthPickerProps) {
  const t = useTranslations("common");
  const format = useFormatter();
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
        {months.map((value) => (
          <option key={value} value={value}>
            {format.dateTime(new Date(`${value}-01T00:00:00Z`), {
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}

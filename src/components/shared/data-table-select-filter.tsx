"use client";

import { useDataTableFilter } from "@/components/shared/data-table";
import { NativeSelect } from "@/components/ui/native-select";

type FilterOption = {
  value: string;
  label: string;
};

type DataTableSelectFilterProps = {
  param: string;
  label: string;
  allLabel: string;
  options: readonly FilterOption[];
};

export function DataTableSelectFilter({
  param,
  label,
  allLabel,
  options,
}: DataTableSelectFilterProps) {
  const { value, setValue, disabled } = useDataTableFilter(param);

  return (
    <label className="flex items-center gap-2 text-body-sm text-muted-foreground">
      {label}
      <NativeSelect
        value={value}
        disabled={disabled}
        onChange={(event) => setValue(event.target.value || null)}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </NativeSelect>
    </label>
  );
}

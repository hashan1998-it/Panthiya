"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useUnsavedChanges } from "@/components/shared/unsaved-changes";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import type { Option, WeekdayName } from "@/lib/get-date-labels";
import type { AttendanceClass } from "../queries";

type AttendancePickerProps = {
  classes: AttendanceClass[];
  classId: string | null;
  sessionDate: string | null;
  dateOptions: Option[];
  weekdays: WeekdayName[];
};

export function AttendancePicker({
  classes,
  classId,
  sessionDate,
  dateOptions,
  weekdays,
}: AttendancePickerProps) {
  const t = useTranslations("attendance");
  const router = useRouter();
  const { confirmLeave } = useUnsavedChanges();

  const selectedClass = classes.find((klass) => klass.id === classId);

  const go = (nextClassId: string, nextDate?: string) => {
    if (!confirmLeave()) return;
    if (!nextClassId) {
      router.replace("/attendance", { scroll: false });
      return;
    }
    const params = new URLSearchParams({ class: nextClassId });
    if (nextDate) params.set("date", nextDate);
    router.replace(`/attendance?${params}`, { scroll: false });
  };

  return (
    <FieldGroup className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <Field>
        <FieldLabel htmlFor="attendance-class">{t("class")}</FieldLabel>
        <NativeSelect
          id="attendance-class"
          className="w-full"
          value={classId ?? ""}
          onChange={(event) => go(event.target.value)}
        >
          <option value="">{t("selectClass")}</option>
          {classes.map((klass) => (
            <option key={klass.id} value={klass.id}>
              {t("classOption", {
                subject: klass.subject,
                grade: klass.grade,
                day: weekdays[klass.day_of_week].long,
                start: klass.start_time.slice(0, 5),
              })}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field data-disabled={!selectedClass}>
        <FieldLabel htmlFor="attendance-date">{t("date")}</FieldLabel>
        <NativeSelect
          id="attendance-date"
          className="w-full"
          value={sessionDate ?? ""}
          disabled={!selectedClass}
          onChange={(event) => go(classId ?? "", event.target.value)}
        >
          {dateOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelect>
      </Field>
    </FieldGroup>
  );
}

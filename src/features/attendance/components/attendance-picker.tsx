"use client";

import { useRouter } from "next/navigation";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import { formatWeekday } from "@/lib/schedule";
import type { AttendanceClass } from "../queries";
import { listSessionDates } from "../session-dates";

type AttendancePickerProps = {
  classes: AttendanceClass[];
  classId: string | null;
  sessionDate: string | null;
  today: string;
};

export function AttendancePicker({ classes, classId, sessionDate, today }: AttendancePickerProps) {
  const t = useTranslations("attendance");
  const format = useFormatter();
  const locale = useLocale();
  const router = useRouter();

  const selectedClass = classes.find((klass) => klass.id === classId);
  const sessionDates = selectedClass ? listSessionDates(selectedClass.day_of_week, today) : [];

  const go = (nextClassId: string, nextDate?: string) => {
    if (!nextClassId) {
      router.replace("/attendance", { scroll: false });
      return;
    }
    const params = new URLSearchParams({ class: nextClassId });
    if (nextDate) params.set("date", nextDate);
    router.replace(`/attendance?${params}`, { scroll: false });
  };

  const dateLabel = (date: string) => {
    const label = format.dateTime(new Date(`${date}T00:00:00Z`), {
      dateStyle: "full",
      timeZone: "UTC",
    });
    return date === today ? t("todayOption", { date: label }) : label;
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
                day: formatWeekday(klass.day_of_week, locale),
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
          {sessionDates.map((date) => (
            <option key={date} value={date}>
              {dateLabel(date)}
            </option>
          ))}
        </NativeSelect>
      </Field>
    </FieldGroup>
  );
}

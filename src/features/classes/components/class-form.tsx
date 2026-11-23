"use client";

import { type MouseEvent, type ReactNode, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { canGoBackInApp } from "@/components/navigation-tracker";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { DAYS_OF_WEEK, formatWeekday } from "@/lib/schedule";
import { createClass, updateClass } from "../actions";
import type { ClassDetail } from "../queries";
import {
  CLASS_GRADES,
  classSchema,
  type ClassFormErrorKey,
  type ClassFormValues,
  type ClassInput,
} from "../schema";

type FieldName = keyof ClassFormValues;

const LABEL_KEYS = {
  subject: "subject",
  grade: "grade",
  day_of_week: "day",
  start_time: "startTime",
  end_time: "endTime",
  monthly_fee: "monthlyFee",
} as const satisfies Record<FieldName, string>;

type ClassFormProps = {
  klass?: ClassDetail;
};

function toFormValues(klass: ClassDetail): ClassFormValues {
  return {
    subject: klass.subject,
    grade: String(klass.grade),
    day_of_week: String(klass.day_of_week),
    start_time: klass.start_time.slice(0, 5),
    end_time: klass.end_time.slice(0, 5),
    monthly_fee: String(klass.monthly_fee),
  };
}

export function ClassForm({ klass }: ClassFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<ClassFormErrorKey>();

  const {
    formState: { errors },
    register,
    handleSubmit,
    getValues,
    setError,
    reset,
  } = useForm<ClassFormValues, unknown, ClassInput>({
    resolver: zodResolver(classSchema),
    mode: "onTouched",
    defaultValues: {
      subject: "",
      grade: "",
      day_of_week: "",
      start_time: "",
      end_time: "",
      monthly_fee: "",
    },
    values: klass ? toFormValues(klass) : undefined,
  });

  const clearForm = () => {
    reset();
    setFormError(undefined);
  };

  const onCancel = (event: MouseEvent<HTMLAnchorElement>) => {
    const opensElsewhere =
      event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (opensElsewhere) return;

    clearForm();
    if (!canGoBackInApp()) return;

    event.preventDefault();
    router.back();
  };

  const errorText = (name: FieldName) => {
    const key = errors[name]?.message;
    return key ? t(`classes.form.errors.${key as ClassFormErrorKey}`) : undefined;
  };

  const onValid = () => {
    setFormError(undefined);

    startTransition(async () => {
      const values = getValues();
      const result = klass ? await updateClass(klass.id, values) : await createClass(values);

      if (!result.ok) {
        for (const [name, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(name as FieldName, { message: messages[0] }, { shouldFocus: true });
          }
        }
        setFormError(result.error);
        return;
      }

      const name = t("classes.nameValue", { subject: result.subject, grade: result.grade });
      toast.success(
        klass ? t("classes.edit.updated", { name }) : t("classes.form.created", { name }),
      );
      clearForm();
      router.push("/classes");
    });
  };

  const field = (name: FieldName, control: ReactNode, hint?: string) => {
    const error = errorText(name);

    return (
      <Field data-invalid={!!error}>
        <FieldLabel htmlFor={`class-${name}`}>
          {t(`classes.form.fields.${LABEL_KEYS[name]}`)}
        </FieldLabel>
        {control}
        {hint && !error && <FieldDescription>{hint}</FieldDescription>}
        <FieldError>{error}</FieldError>
      </Field>
    );
  };

  const inputProps = (name: FieldName) => ({
    id: `class-${name}`,
    "aria-invalid": !!errors[name],
    ...register(name),
  });

  return (
    <form noValidate className="flex max-w-2xl flex-col gap-6" onSubmit={handleSubmit(onValid)}>
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        {field("subject", <Input type="text" {...inputProps("subject")} />)}
        {field(
          "grade",
          <NativeSelect className="w-full" {...inputProps("grade")}>
            <option value="">{t("classes.form.selectGrade")}</option>
            {CLASS_GRADES.map((grade) => (
              <option key={grade} value={grade}>
                {t("classes.gradeValue", { grade })}
              </option>
            ))}
          </NativeSelect>,
        )}
        {field(
          "day_of_week",
          <NativeSelect className="w-full" {...inputProps("day_of_week")}>
            <option value="">{t("classes.form.selectDay")}</option>
            {DAYS_OF_WEEK.map((day) => (
              <option key={day} value={day}>
                {formatWeekday(day, locale)}
              </option>
            ))}
          </NativeSelect>,
        )}
        {field(
          "monthly_fee",
          <Input type="text" inputMode="decimal" {...inputProps("monthly_fee")} />,
          t("classes.form.feeHint"),
        )}
        {field("start_time", <Input type="time" {...inputProps("start_time")} />)}
        {field("end_time", <Input type="time" {...inputProps("end_time")} />)}
      </FieldGroup>
      {formError && (
        <p role="alert" className="text-body-sm text-destructive-foreground">
          {t(`classes.form.errors.${formError}`)}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? t("classes.form.submitting")
            : klass
              ? t("classes.edit.submit")
              : t("classes.form.submit")}
        </Button>
        <Link href="/classes" onClick={onCancel} className={buttonVariants({ variant: "outline" })}>
          {t("common.cancel")}
        </Link>
      </div>
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { getToday } from "@/lib/dates";
import { createStudent } from "../actions";
import { STUDENT_GRADES } from "../filters";
import {
  studentSchema,
  type StudentFormErrorKey,
  type StudentFormValues,
  type StudentInput,
} from "../schema";

type FieldName = keyof StudentFormValues;

export function StudentForm() {
  const t = useTranslations();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    formState: { errors },
    register,
    handleSubmit,
    getValues,
    setError,
    reset,
  } = useForm<StudentFormValues, unknown, StudentInput>({
    resolver: zodResolver(studentSchema),
    mode: "onTouched",
    defaultValues: {
      admission_no: "",
      full_name: "",
      grade: "",
      phone: "",
      parent_name: "",
      parent_phone: "",
      joined_on: getToday(),
    },
  });

  const [formError, setFormError] = useState<StudentFormErrorKey>();

  const clearForm = () => {
    reset();
    setFormError(undefined);
  };

  const errorText = (name: FieldName) => {
    const key = errors[name]?.message;
    return key ? t(`students.form.errors.${key as StudentFormErrorKey}`) : undefined;
  };

  const onValid = () => {
    setFormError(undefined);

    startTransition(async () => {
      const result = await createStudent(getValues());

      if (!result.ok) {
        for (const [name, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(name as FieldName, { message: messages[0] }, { shouldFocus: true });
          }
        }
        setFormError(result.error);
        return;
      }

      toast.success(t("students.form.created", { name: result.fullName }));
      clearForm();
      router.push(`/students/${result.id}`);
    });
  };

  const textField = (name: FieldName, options: { optional?: boolean; hint?: string } = {}) => {
    const error = errorText(name);
    const id = `student-${name}`;

    return (
      <Field data-invalid={!!error}>
        <FieldLabel htmlFor={id}>
          {t(`students.form.fields.${toLabelKey(name)}`)}
          {options.optional && (
            <span className="font-normal text-muted-foreground">
              {" "}
              ({t("students.form.optional")})
            </span>
          )}
        </FieldLabel>
        <Input
          id={id}
          type={name === "joined_on" ? "date" : name.endsWith("phone") ? "tel" : "text"}
          inputMode={name.endsWith("phone") ? "tel" : undefined}
          aria-invalid={!!error}
          {...register(name)}
        />
        {options.hint && !error && <FieldDescription>{options.hint}</FieldDescription>}
        <FieldError>{error}</FieldError>
      </Field>
    );
  };

  const gradeError = errorText("grade");

  return (
    <form noValidate className="flex max-w-2xl flex-col gap-6" onSubmit={handleSubmit(onValid)}>
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        {textField("admission_no")}
        {textField("full_name")}
        <Field data-invalid={!!gradeError}>
          <FieldLabel htmlFor="student-grade">{t("students.form.fields.grade")}</FieldLabel>
          <NativeSelect
            id="student-grade"
            className="w-full"
            aria-invalid={!!gradeError}
            {...register("grade")}
          >
            <option value="">{t("students.form.selectGrade")}</option>
            {STUDENT_GRADES.map((grade) => (
              <option key={grade} value={grade}>
                {t("students.filters.gradeOption", { grade })}
              </option>
            ))}
          </NativeSelect>
          <FieldError>{gradeError}</FieldError>
        </Field>
        {textField("joined_on")}
        {textField("phone", { optional: true, hint: t("students.form.phoneHint") })}
        {textField("parent_name", { optional: true })}
        {textField("parent_phone", { optional: true, hint: t("students.form.phoneHint") })}
      </FieldGroup>
      {formError && (
        <p role="alert" className="text-body-sm text-destructive-foreground">
          {t(`students.form.errors.${formError}`)}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? t("students.form.submitting") : t("students.form.submit")}
        </Button>
        <Link
          href="/students"
          onClick={clearForm}
          className={buttonVariants({ variant: "outline" })}
        >
          {t("common.cancel")}
        </Link>
      </div>
    </form>
  );
}

const LABEL_KEYS = {
  admission_no: "admissionNo",
  full_name: "fullName",
  grade: "grade",
  phone: "phone",
  parent_name: "parentName",
  parent_phone: "parentPhone",
  joined_on: "joinedOn",
} as const satisfies Record<FieldName, string>;

function toLabelKey(name: FieldName) {
  return LABEL_KEYS[name];
}

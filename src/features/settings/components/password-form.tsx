"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { changePassword } from "../actions";
import { changePasswordSchema, type ChangePasswordValues, type PasswordErrorKey } from "../schema";

type FieldName = keyof ChangePasswordValues;

const FIELDS: { name: FieldName; autoComplete: string }[] = [
  { name: "current", autoComplete: "current-password" },
  { name: "next", autoComplete: "new-password" },
  { name: "confirm", autoComplete: "new-password" },
];

export function PasswordForm() {
  const t = useTranslations("settings.password");
  const [pending, startTransition] = useTransition();

  const {
    formState: { errors },
    register,
    handleSubmit,
    getValues,
    setError,
    reset,
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onTouched",
    defaultValues: { current: "", next: "", confirm: "" },
  });

  const onValid = () => {
    startTransition(async () => {
      const result = await changePassword(getValues());

      if (!result.ok) {
        if (result.field) {
          setError(result.field, { message: result.error }, { shouldFocus: true });
        } else {
          toast.error(t(`errors.${result.error}`));
        }
        return;
      }

      toast.success(t("changed"));
      reset();
    });
  };

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit(onValid)}>
      <FieldGroup className="grid gap-4">
        {FIELDS.map(({ name, autoComplete }) => {
          const key = errors[name]?.message;

          return (
            <Field key={name} data-invalid={!!key}>
              <FieldLabel htmlFor={`password-${name}`}>{t(name)}</FieldLabel>
              <Input
                id={`password-${name}`}
                type="password"
                autoComplete={autoComplete}
                aria-invalid={!!key}
                {...register(name)}
              />
              <FieldError>{key ? t(`errors.${key as PasswordErrorKey}`) : undefined}</FieldError>
            </Field>
          );
        })}
      </FieldGroup>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t("pending") : t("submit")}
      </Button>
    </form>
  );
}

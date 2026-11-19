"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { type SubmitHandler, useForm } from "react-hook-form";
import { type SignInInput, signInSchema } from "../schema";
import { signIn, type SignInState } from "../actions";
import { startTransition, useActionState } from "react";

const initialState: SignInState = { fieldErrors: {} };

function SignInForm() {
  const t = useTranslations("auth.signIn");
  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema), mode: "onTouched" });

  const [state, formAction, pending] = useActionState(signIn, initialState);

  const emailError = errors.email?.message ?? state.fieldErrors.email?.[0];
  const passwordError = errors.password?.message ?? state.fieldErrors.password?.[0];

  const onSuccess: SubmitHandler<SignInInput> = (data) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    startTransition(() => formAction(formData));
  };
  return (
    <form noValidate className="flex flex-col gap-6" onSubmit={handleSubmit(onSuccess)}>
      <FieldGroup className="gap-4">
        <Field data-invalid={!!emailError}>
          <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!emailError}
            {...register("email")}
            placeholder={t("emailPlaceholder")}
          />
          <FieldError>{emailError}</FieldError>
        </Field>
        <Field data-invalid={!!passwordError}>
          <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
          <Input
            id="password"
            type="password"
            aria-invalid={!!passwordError}
            {...register("password")}
            autoComplete="current-password"
          />
          <FieldError>{passwordError}</FieldError>
        </Field>
      </FieldGroup>
      {state.error && (
        <p role="alert" className="text-body-sm text-destructive-foreground">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}

export default SignInForm;

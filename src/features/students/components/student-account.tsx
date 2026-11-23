"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createStudentAccount } from "../actions";
import {
  studentAccountSchema,
  type StudentAccountErrorKey,
  type StudentAccountValues,
} from "../schema";

type StudentAccountProps = {
  studentId: string;
  fullName: string;
  hasAccount: boolean;
};

type CreatedLogin = { email: string; tempPassword: string };

export function StudentAccount({ studentId, fullName, hasAccount }: StudentAccountProps) {
  const t = useTranslations("students.account");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<CreatedLogin | null>(null);
  const [formError, setFormError] = useState<StudentAccountErrorKey>();
  const [pending, startTransition] = useTransition();

  const {
    formState: { errors },
    register,
    handleSubmit,
    getValues,
    setError,
    reset,
  } = useForm<StudentAccountValues>({
    resolver: zodResolver(studentAccountSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  const onOpenChange = (nextOpen: boolean) => {
    if (pending) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      reset();
      setFormError(undefined);
      setCreated(null);
    }
  };

  const onValid = () => {
    setFormError(undefined);

    startTransition(async () => {
      const result = await createStudentAccount(studentId, getValues());

      if (!result.ok) {
        const emailError = result.fieldErrors.email?.[0];
        if (emailError) setError("email", { message: emailError }, { shouldFocus: true });
        setFormError(result.error);
        return;
      }

      setCreated({ email: result.email, tempPassword: result.tempPassword });
    });
  };

  const copyPassword = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.tempPassword);
      toast.success(t("createdDialog.copied"));
    } catch {
      toast.error(t("createdDialog.copyFailed"));
    }
  };

  const emailErrorKey = errors.email?.message as StudentAccountErrorKey | undefined;
  const emailError = emailErrorKey ? t(`errors.${emailErrorKey}`) : undefined;

  return (
    <>
      {hasAccount && !open ? (
        <Badge variant="success" className="h-10 px-4">
          {t("active")}
        </Badge>
      ) : (
        <Button variant="outline" onClick={() => onOpenChange(true)}>
          <KeyRound data-icon="inline-start" aria-hidden />
          {t("createLogin")}
        </Button>
      )}
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          {created ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("createdDialog.title")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("createdDialog.description", { name: fullName })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <dl className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <dt className="text-body-sm text-muted-foreground">{t("createdDialog.email")}</dt>
                  <dd className="text-body-sm break-all text-foreground">{created.email}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-body-sm text-muted-foreground">
                    {t("createdDialog.password")}
                  </dt>
                  <dd className="flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2">
                    <code className="font-mono text-body-md select-all">
                      {created.tempPassword}
                    </code>
                    <Button variant="ghost" size="sm" onClick={copyPassword}>
                      <Copy data-icon="inline-start" aria-hidden />
                      {t("createdDialog.copy")}
                    </Button>
                  </dd>
                </div>
              </dl>
              <AlertDialogFooter>
                <AlertDialogCancel variant="default">{t("createdDialog.done")}</AlertDialogCancel>
              </AlertDialogFooter>
            </>
          ) : (
            <form noValidate className="contents" onSubmit={handleSubmit(onValid)}>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("createDialog.title", { name: fullName })}</AlertDialogTitle>
                <AlertDialogDescription>{t("createDialog.description")}</AlertDialogDescription>
              </AlertDialogHeader>
              <Field data-invalid={!!emailError}>
                <FieldLabel htmlFor="student-account-email">{t("createDialog.email")}</FieldLabel>
                <Input
                  id="student-account-email"
                  type="email"
                  autoComplete="off"
                  aria-invalid={!!emailError}
                  {...register("email")}
                />
                <FieldError>{emailError}</FieldError>
              </Field>
              {formError && (
                <p role="alert" className="text-body-sm text-destructive-foreground">
                  {t(`errors.${formError}`)}
                </p>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel disabled={pending}>{tCommon("cancel")}</AlertDialogCancel>
                <Button type="submit" disabled={pending}>
                  {pending ? t("createDialog.pending") : t("createDialog.submit")}
                </Button>
              </AlertDialogFooter>
            </form>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

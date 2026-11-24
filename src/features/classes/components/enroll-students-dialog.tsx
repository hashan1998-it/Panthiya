"use client";

import { type FormEvent, useMemo, useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { enrollStudents } from "../enrollment-actions";
import {
  DISCOUNT_TYPES,
  enrollSchema,
  type EnrollErrorKey,
  type EnrollFormValues,
} from "../enrollment-schema";
import type { EnrollableStudent } from "../queries";

type DiscountType = (typeof DISCOUNT_TYPES)[number];
type Selection = { discount_type: DiscountType; discount_percent: string };

type EnrollStudentsDialogProps = {
  classId: string;
  className: string;
  grade: number;
  students: EnrollableStudent[];
};

const DISCOUNT_LABEL_KEYS = {
  none: "discountNone",
  half: "discountHalf",
  free: "discountFree",
  custom: "discountCustom",
} as const satisfies Record<DiscountType, string>;

export function EnrollStudentsDialog({
  classId,
  className,
  grade,
  students,
}: EnrollStudentsDialogProps) {
  const t = useTranslations("classes.enroll");
  const tCommon = useTranslations("common");
  const tClasses = useTranslations("classes");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showAllGrades, setShowAllGrades] = useState(false);
  const [selected, setSelected] = useState<Map<string, Selection>>(new Map());
  const [percentErrors, setPercentErrors] = useState<Set<string>>(new Set());
  const [formError, setFormError] = useState<EnrollErrorKey>();
  const [pending, startTransition] = useTransition();

  const visibleStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter(
      (student) =>
        (showAllGrades || student.grade === grade) &&
        (!term ||
          student.full_name.toLowerCase().includes(term) ||
          student.admission_no.toLowerCase().includes(term)),
    );
  }, [students, search, showAllGrades, grade]);

  const clear = () => {
    setSearch("");
    setShowAllGrades(false);
    setSelected(new Map());
    setPercentErrors(new Set());
    setFormError(undefined);
  };

  const onOpenChange = (nextOpen: boolean) => {
    if (pending) return;
    setOpen(nextOpen);
    if (!nextOpen) clear();
  };

  const toggle = (studentId: string, checked: boolean) => {
    setSelected((current) => {
      const next = new Map(current);
      if (checked) next.set(studentId, { discount_type: "none", discount_percent: "" });
      else next.delete(studentId);
      return next;
    });
    setFormError(undefined);
  };

  const update = (studentId: string, patch: Partial<Selection>) => {
    setSelected((current) => {
      const selection = current.get(studentId);
      if (!selection) return current;
      return new Map(current).set(studentId, { ...selection, ...patch });
    });
    setPercentErrors((current) => {
      if (!current.has(studentId)) return current;
      const next = new Set(current);
      next.delete(studentId);
      return next;
    });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(undefined);

    const values: EnrollFormValues = {
      enrollments: [...selected].map(([student_id, selection]) => ({
        student_id,
        ...selection,
      })),
    };

    const parsed = enrollSchema.safeParse(values);
    if (!parsed.success) {
      const invalid = new Set<string>();
      for (const issue of parsed.error.issues) {
        const index = issue.path[1];
        if (typeof index === "number") invalid.add(values.enrollments[index].student_id);
        else setFormError(issue.message as EnrollErrorKey);
      }
      setPercentErrors(invalid);
      if (invalid.size > 0) {
        setSearch("");
        if (students.some((student) => invalid.has(student.id) && student.grade !== grade)) {
          setShowAllGrades(true);
        }
      }
      return;
    }

    startTransition(async () => {
      const result = await enrollStudents(classId, values);

      if (!result.ok) {
        setFormError(result.error);
        return;
      }

      toast.success(t("enrolled", { count: result.count }));
      setOpen(false);
      clear();
    });
  };

  return (
    <>
      <Button variant="outline" onClick={() => onOpenChange(true)}>
        <UserPlus data-icon="inline-start" aria-hidden />
        {t("trigger")}
      </Button>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-h-[calc(100dvh-2rem)] grid-rows-[auto_auto_minmax(0,1fr)_auto] data-[size=default]:max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("title", { name: className })}</AlertDialogTitle>
            <AlertDialogDescription>{t("description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("search")}
              aria-label={t("search")}
              className="sm:flex-1"
            />
            <label className="flex items-center gap-2 text-body-sm text-body">
              <Switch
                checked={showAllGrades}
                onCheckedChange={setShowAllGrades}
                aria-labelledby="enroll-show-all-grades"
              />
              <span id="enroll-show-all-grades">{t("showAllGrades")}</span>
            </label>
          </div>
          <form
            id="enroll-students-form"
            noValidate
            onSubmit={onSubmit}
            className="-mx-6 min-h-0 overflow-y-auto border-y border-border px-6"
          >
            {visibleStudents.length === 0 ? (
              <p className="py-8 text-center text-body-sm text-muted-foreground">
                {students.length === 0 ? t("empty") : t("noMatch")}
              </p>
            ) : (
              <ul aria-label={t("listLabel")} className="divide-y divide-border">
                {visibleStudents.map((student) => {
                  const selection = selected.get(student.id);
                  const percentId = `enroll-percent-${student.id}`;
                  const percentError = percentErrors.has(student.id);
                  const nameId = `enroll-name-${student.id}`;

                  return (
                    <li key={student.id} className="flex flex-col gap-3 py-3">
                      <label className="flex items-center gap-3">
                        <Checkbox
                          checked={!!selection}
                          onCheckedChange={(checked) => toggle(student.id, checked)}
                          aria-labelledby={nameId}
                        />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span id={nameId} className="truncate text-body-sm text-foreground">
                            {student.full_name}
                          </span>
                          <span className="text-caption text-muted-foreground">
                            <span className="font-mono">{student.admission_no}</span>
                            {" · "}
                            {tClasses("gradeValue", { grade: student.grade })}
                          </span>
                        </span>
                      </label>
                      {selection && (
                        <div className="flex flex-wrap items-start gap-3 pl-7">
                          <NativeSelect
                            aria-label={t("discountFor", { name: student.full_name })}
                            value={selection.discount_type}
                            onChange={(event) =>
                              update(student.id, {
                                discount_type: event.target.value as DiscountType,
                              })
                            }
                          >
                            {DISCOUNT_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {t(DISCOUNT_LABEL_KEYS[type])}
                              </option>
                            ))}
                          </NativeSelect>
                          {selection.discount_type === "custom" && (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Input
                                  id={percentId}
                                  inputMode="numeric"
                                  value={selection.discount_percent}
                                  onChange={(event) =>
                                    update(student.id, { discount_percent: event.target.value })
                                  }
                                  aria-label={t("percentFor", { name: student.full_name })}
                                  aria-invalid={percentError}
                                  aria-describedby={percentError ? `${percentId}-error` : undefined}
                                  className="w-20"
                                />
                                <span className="text-body-sm text-muted-foreground">%</span>
                              </div>
                              {percentError && (
                                <p
                                  id={`${percentId}-error`}
                                  className="text-body-sm text-destructive-foreground"
                                >
                                  {t("errors.percentInvalid")}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </form>
          <div className="flex flex-col gap-3">
            {formError && (
              <p role="alert" className="text-body-sm text-destructive-foreground">
                {t(`errors.${formError}`)}
              </p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>{tCommon("cancel")}</AlertDialogCancel>
              <Button type="submit" form="enroll-students-form" disabled={pending}>
                {pending ? t("pending") : t("submit", { count: selected.size })}
              </Button>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

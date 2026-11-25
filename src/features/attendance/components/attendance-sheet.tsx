"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { Check, CheckCheck, Clock, Users, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { useUnsavedChanges } from "@/components/shared/unsaved-changes";
import { Button } from "@/components/ui/button";
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control";
import { saveAttendance } from "../actions";
import type { RosterStudent } from "../queries";
import type { AttendanceStatus } from "../summary";

type Marks = Record<string, AttendanceStatus | null>;

type AttendanceSheetProps = {
  classId: string;
  sessionDate: string;
  roster: RosterStudent[];
};

const STATUS_ICONS = { present: Check, late: Clock, absent: X } as const;

function toMarks(roster: RosterStudent[]): Marks {
  return Object.fromEntries(roster.map((student) => [student.id, student.status]));
}

export function AttendanceSheet({ classId, sessionDate, roster }: AttendanceSheetProps) {
  const t = useTranslations("attendance.sheet");
  const tErrors = useTranslations("attendance.errors");
  const [saved, setSaved] = useState<Marks>(() => toMarks(roster));
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved);
  const [draft, setDraft] = useState<Marks>(() => toMarks(roster));
  const [pending, startTransition] = useTransition();
  const { setDirty } = useUnsavedChanges();

  const changes = roster.flatMap((student) => {
    const status = draft[student.id];
    return status && status !== optimisticSaved[student.id]
      ? [{ student_id: student.id, status }]
      : [];
  });
  const markedCount = roster.filter((student) => draft[student.id]).length;
  const hasChanges = changes.length > 0;

  useEffect(() => {
    setDirty(hasChanges);
    return () => setDirty(false);
  }, [hasChanges, setDirty]);

  if (roster.length === 0) {
    return <EmptyState icon={Users} title={t("emptyTitle")} description={t("emptyDescription")} />;
  }

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setDraft((current) => ({ ...current, [studentId]: status }));
  };

  const markAllPresent = () => {
    setDraft(Object.fromEntries(roster.map((student) => [student.id, "present"])));
  };

  const save = () => {
    if (changes.length === 0) return;
    const next = { ...saved, ...Object.fromEntries(changes.map((c) => [c.student_id, c.status])) };

    startTransition(async () => {
      setOptimisticSaved(next);
      const result = await saveAttendance({
        class_id: classId,
        session_date: sessionDate,
        marks: changes,
      }).catch(() => ({ ok: false as const, error: "saveFailed" as const }));

      if (!result.ok) {
        toast.error(tErrors(result.error));
        return;
      }

      startTransition(() => setSaved(next));
      toast.success(t("saved", { count: result.count }));
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-body-sm text-foreground">
            {t("marked", { marked: markedCount, total: roster.length })}
          </p>
          <p aria-live="polite" className="text-body-sm text-muted-foreground">
            {changes.length > 0 ? t("unsaved", { count: changes.length }) : t("allSaved")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={markAllPresent} disabled={pending}>
            <CheckCheck data-icon="inline-start" aria-hidden />
            {t("markAllPresent")}
          </Button>
          <Button onClick={save} disabled={pending || changes.length === 0}>
            {pending ? t("saving") : t("save")}
          </Button>
        </div>
      </div>
      <ul
        aria-label={t("listLabel")}
        className="divide-y divide-border rounded-xl border border-border"
      >
        {roster.map((student) => {
          const status = draft[student.id];
          const changed = !!status && status !== optimisticSaved[student.id];

          return (
            <li
              key={student.id}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden
                  className={
                    changed ? "size-2 shrink-0 rounded-full bg-warning" : "size-2 shrink-0"
                  }
                />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-body-sm text-foreground">{student.full_name}</span>
                  <span className="font-mono text-caption text-muted-foreground">
                    {student.admission_no}
                  </span>
                </div>
              </div>
              <SegmentedControl<AttendanceStatus | null>
                aria-label={t("statusFor", { name: student.full_name })}
                value={status}
                onValueChange={(value) => value && setStatus(student.id, value)}
                disabled={pending}
                className="w-full sm:w-fit"
              >
                {(["present", "late", "absent"] as const).map((value) => {
                  const Icon = STATUS_ICONS[value];
                  return (
                    <SegmentedControlItem
                      key={value}
                      value={value}
                      className="flex-auto px-1 text-caption sm:flex-none sm:px-3 sm:text-body-sm"
                    >
                      <Icon aria-hidden />
                      {t(value)}
                    </SegmentedControlItem>
                  );
                })}
              </SegmentedControl>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

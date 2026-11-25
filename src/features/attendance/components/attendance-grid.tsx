import type { ReactNode } from "react";
import { Check, Clock, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { summarizeAttendance, type AttendanceStatus } from "../summary";

export type AttendanceGridRow = {
  id: string;
  label: ReactNode;
  marks: Record<string, AttendanceStatus>;
  sessionDates?: string[];
};

type AttendanceGridProps = {
  label: string;
  rowHeader: string;
  dates: string[];
  rows: AttendanceGridRow[];
};

const STATUS_STYLES = {
  present: { icon: Check, className: "bg-success/12 text-success-foreground" },
  late: { icon: Clock, className: "bg-warning/12 text-warning-foreground" },
  absent: { icon: X, className: "bg-destructive/12 text-destructive-foreground" },
} as const;

const STICKY = "sticky left-0 z-10 bg-background";

export function AttendanceGrid({ label, rowHeader, dates, rows }: AttendanceGridProps) {
  const t = useTranslations("attendance.history");
  const format = useFormatter();

  const dayLabel = (date: string) =>
    format.dateTime(new Date(`${date}T00:00:00Z`), {
      weekday: "short",
      day: "numeric",
      timeZone: "UTC",
    });

  const percent = (row: AttendanceGridRow) => {
    const summary = summarizeAttendance(
      dates.flatMap((date) => (row.marks[date] ? [{ status: row.marks[date] }] : [])),
    );
    return summary.rate === null ? t("noRate") : format.number(summary.rate, { style: "percent" });
  };

  return (
    <Table aria-label={label}>
      <TableHeader>
        <TableRow>
          <TableHead className={cn(STICKY, "bg-muted")}>{rowHeader}</TableHead>
          {dates.map((date) => (
            <TableHead key={date} className="text-center whitespace-nowrap">
              {dayLabel(date)}
            </TableHead>
          ))}
          <TableHead className="text-right">{t("rate")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className={cn(STICKY, "min-w-40")}>{row.label}</TableCell>
            {dates.map((date) => {
              const status = row.marks[date];
              const isSession = !row.sessionDates || row.sessionDates.includes(date);

              if (status) {
                const { icon: Icon, className } = STATUS_STYLES[status];
                return (
                  <TableCell key={date} className="text-center">
                    <span
                      title={t(status)}
                      className={cn(
                        "inline-flex size-6 items-center justify-center rounded-full",
                        className,
                      )}
                    >
                      <Icon className="size-3.5" aria-hidden />
                      <span className="sr-only">{t(status)}</span>
                    </span>
                  </TableCell>
                );
              }

              return (
                <TableCell key={date} className="text-center text-muted-foreground">
                  {isSession ? (
                    <>
                      <span aria-hidden>–</span>
                      <span className="sr-only">{t("notMarked")}</span>
                    </>
                  ) : (
                    <span className="sr-only">{t("noSession")}</span>
                  )}
                </TableCell>
              );
            })}
            <TableCell className="text-right tabular-nums">{percent(row)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

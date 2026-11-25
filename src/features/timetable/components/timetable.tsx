"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control";
import type { WeekdayName } from "@/lib/get-date-labels";
import { cn } from "@/lib/utils";
import { getTimeRange, layoutDay, toMinutes, WEEK_DAYS, type TimetableClass } from "../layout";

const PX_PER_MINUTE = 1;

type TimetableProps = {
  classes: TimetableClass[];
  today: number;
  weekdays: WeekdayName[];
};

function formatClock(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function Timetable({ classes, today, weekdays }: TimetableProps) {
  const t = useTranslations("timetable");
  const [selectedDay, setSelectedDay] = useState(today);

  const range = getTimeRange(classes);
  const height = (range.end - range.start) * PX_PER_MINUTE;
  const hours = Array.from(
    { length: (range.end - range.start) / 60 + 1 },
    (_, index) => range.start + index * 60,
  );

  const dayColumn = (day: number) => {
    const dayClasses = layoutDay(classes.filter((klass) => klass.day_of_week === day));
    const dayName = weekdays[day].long;

    return (
      <div
        role="list"
        aria-label={t("dayLabel", { day: dayName, count: dayClasses.length })}
        className={cn("relative border-l border-border", day === today && "bg-muted/40")}
        style={{ height }}
      >
        {dayClasses.map((klass) => {
          const start = toMinutes(klass.start_time);
          const end = toMinutes(klass.end_time);
          const name = t("classValue", { subject: klass.subject, grade: klass.grade });
          const time = t("time", { start: formatClock(start), end: formatClock(end) });

          return (
            <div
              key={klass.id}
              role="listitem"
              className="absolute p-0.5"
              style={{
                top: (start - range.start) * PX_PER_MINUTE,
                height: (end - start) * PX_PER_MINUTE,
                left: `${(klass.lane / klass.lanes) * 100}%`,
                width: `${100 / klass.lanes}%`,
              }}
            >
              <Link
                href={`/classes/${klass.id}`}
                aria-label={t("blockLabel", { name, day: dayName, time })}
                className="flex h-full flex-col gap-0.5 overflow-hidden rounded-md border border-l-4 border-border border-l-chart-1 bg-card px-2 py-1 text-left hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="line-clamp-2 text-caption font-medium text-foreground">
                  {name}
                </span>
                <span className="truncate text-caption text-muted-foreground tabular-nums">
                  {time}
                </span>
              </Link>
            </div>
          );
        })}
      </div>
    );
  };

  const timeGutter = (
    <div aria-hidden="true" className="relative" style={{ height }}>
      {hours.map((minutes) => (
        <span
          key={minutes}
          className="absolute right-2 -translate-y-1/2 text-caption text-muted-foreground tabular-nums"
          style={{ top: (minutes - range.start) * PX_PER_MINUTE }}
        >
          {formatClock(minutes)}
        </span>
      ))}
    </div>
  );

  const hourLines = (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {hours.map((minutes) => (
        <div
          key={minutes}
          className="absolute inset-x-0 border-t border-border/60"
          style={{ top: (minutes - range.start) * PX_PER_MINUTE }}
        />
      ))}
    </div>
  );

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-border md:block">
        <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] border-b border-border">
          <span />
          {WEEK_DAYS.map((day) => (
            <span
              key={day}
              className={cn(
                "border-l border-border px-2 py-2 text-center text-body-sm text-muted-foreground",
                day === today && "font-medium text-foreground",
              )}
            >
              {weekdays[day].long}
            </span>
          ))}
        </div>
        <div className="relative grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] py-3">
          {timeGutter}
          {WEEK_DAYS.map((day) => (
            <div key={day} className="relative">
              {hourLines}
              {dayColumn(day)}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 md:hidden">
        <div className="-mx-4 overflow-x-auto px-4">
          <SegmentedControl
            aria-label={t("dayPicker")}
            value={selectedDay}
            onValueChange={(value) => setSelectedDay(Number(value))}
          >
            {WEEK_DAYS.map((day) => (
              <SegmentedControlItem key={day} value={day} aria-label={weekdays[day].long}>
                {weekdays[day].short}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="relative grid grid-cols-[3.5rem_minmax(0,1fr)] py-3">
            {timeGutter}
            <div className="relative">
              {hourLines}
              {dayColumn(selectedDay)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

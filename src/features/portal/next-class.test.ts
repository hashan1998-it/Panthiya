import { describe, expect, it } from "vitest";
import { findNextClass, type ScheduledClass } from "./next-class";

const WEDNESDAY = "2026-11-25";

function klass(id: string, day: number, start: string, end: string): ScheduledClass {
  return { id, day_of_week: day, start_time: `${start}:00`, end_time: `${end}:00` };
}

const maths = klass("maths", 6, "08:00", "10:00");
const science = klass("science", 6, "10:30", "12:30");
const english = klass("english", 3, "15:00", "16:30");

function next(classes: ScheduledClass[], time: string) {
  const result = findNextClass(classes, WEDNESDAY, time);
  return result && `${result.klass.id} ${result.date}`;
}

describe("findNextClass", () => {
  it("returns nothing when there are no classes", () => {
    expect(next([], "09:00")).toBeNull();
  });

  it("picks today's class when it hasn't ended yet", () => {
    expect(next([maths, english], "09:00")).toBe("english 2026-11-25");
    expect(next([maths, english], "16:00")).toBe("english 2026-11-25");
  });

  it("moves to a later day once today's class has ended", () => {
    expect(next([maths, english], "16:30")).toBe("maths 2026-11-28");
  });

  it("picks the earliest class on the next day that has one", () => {
    expect(next([science, maths], "18:00")).toBe("maths 2026-11-28");
  });

  it("wraps around to next week's same weekday", () => {
    expect(next([english], "17:00")).toBe("english 2026-12-02");
  });

  it("crosses into the next month and year", () => {
    expect(findNextClass([klass("a", 5, "08:00", "09:00")], "2026-12-31", "10:00")).toEqual({
      klass: klass("a", 5, "08:00", "09:00"),
      date: "2027-01-01",
    });
  });
});

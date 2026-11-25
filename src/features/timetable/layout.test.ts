import { describe, expect, it } from "vitest";
import { getTimeRange, layoutDay, toMinutes, type TimetableClass } from "./layout";

function klass(id: string, start: string, end: string): TimetableClass {
  return {
    id,
    subject: id,
    grade: 10,
    day_of_week: 6,
    start_time: `${start}:00`,
    end_time: `${end}:00`,
  };
}

function lanes(classes: TimetableClass[]) {
  return Object.fromEntries(
    layoutDay(classes).map((item) => [item.id, `${item.lane}/${item.lanes}`]),
  );
}

describe("toMinutes", () => {
  it("reads HH:MM and HH:MM:SS", () => {
    expect(toMinutes("08:30")).toBe(510);
    expect(toMinutes("16:45:00")).toBe(1005);
  });
});

describe("getTimeRange", () => {
  it("rounds out to whole hours around the classes", () => {
    expect(getTimeRange([klass("a", "08:30", "10:00"), klass("b", "15:00", "16:45")])).toEqual({
      start: 8 * 60,
      end: 17 * 60,
    });
  });

  it("falls back to 08:00–18:00 when there are no classes", () => {
    expect(getTimeRange([])).toEqual({ start: 480, end: 1080 });
  });
});

describe("layoutDay", () => {
  it("gives classes that don't overlap the full width, in time order", () => {
    const placed = layoutDay([klass("late", "10:30", "12:30"), klass("early", "08:00", "10:00")]);

    expect(placed.map((item) => item.id)).toEqual(["early", "late"]);
    expect(lanes(placed)).toEqual({ early: "0/1", late: "0/1" });
  });

  it("treats a class that starts when another ends as not overlapping", () => {
    expect(lanes([klass("a", "08:00", "10:00"), klass("b", "10:00", "11:00")])).toEqual({
      a: "0/1",
      b: "0/1",
    });
  });

  it("puts overlapping classes side by side", () => {
    expect(lanes([klass("a", "08:00", "10:00"), klass("b", "09:00", "11:00")])).toEqual({
      a: "0/2",
      b: "1/2",
    });
  });

  it("reuses a free lane and shares the lane count across the whole overlap group", () => {
    expect(
      lanes([
        klass("a", "08:00", "12:00"),
        klass("b", "08:30", "09:30"),
        klass("c", "10:00", "11:00"),
        klass("d", "13:00", "14:00"),
      ]),
    ).toEqual({ a: "0/2", b: "1/2", c: "1/2", d: "0/1" });
  });

  it("uses three lanes when three classes overlap at once", () => {
    expect(
      lanes([
        klass("a", "08:00", "10:00"),
        klass("b", "08:00", "09:00"),
        klass("c", "08:30", "09:30"),
      ]),
    ).toEqual({ b: "0/3", a: "1/3", c: "2/3" });
  });
});

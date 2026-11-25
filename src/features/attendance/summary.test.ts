import { describe, expect, it } from "vitest";
import {
  summarizeAttendance,
  summarizeAttendanceByClass,
  summarizeAttendanceOnDates,
  type AttendanceStatus,
} from "./summary";

const rows = (...statuses: AttendanceStatus[]) => statuses.map((status) => ({ status }));

describe("summarizeAttendance", () => {
  it("has no rate when there are no sessions", () => {
    expect(summarizeAttendance([])).toEqual({
      present: 0,
      late: 0,
      absent: 0,
      total: 0,
      rate: null,
    });
  });

  it("counts late as attended", () => {
    expect(summarizeAttendance(rows("present", "late", "absent", "present"))).toEqual({
      present: 2,
      late: 1,
      absent: 1,
      total: 4,
      rate: 0.75,
    });
  });

  it("is 0 when every session was missed", () => {
    expect(summarizeAttendance(rows("absent", "absent")).rate).toBe(0);
  });

  it("is 1 when every session was attended", () => {
    expect(summarizeAttendance(rows("present", "late", "present")).rate).toBe(1);
  });
});

describe("summarizeAttendanceByClass", () => {
  it("summarizes each class on its own", () => {
    const byClass = summarizeAttendanceByClass([
      { class_id: "maths", status: "present" },
      { class_id: "science", status: "absent" },
      { class_id: "maths", status: "absent" },
      { class_id: "science", status: "late" },
      { class_id: "maths", status: "present" },
    ]);

    expect(byClass.get("maths")).toMatchObject({ present: 2, absent: 1, total: 3 });
    expect(byClass.get("maths")?.rate).toBeCloseTo(2 / 3);
    expect(byClass.get("science")).toMatchObject({ late: 1, absent: 1, total: 2, rate: 0.5 });
  });

  it("has no entry for a class with no sessions", () => {
    expect(summarizeAttendanceByClass([]).size).toBe(0);
  });
});

describe("summarizeAttendanceOnDates", () => {
  const october = ["2026-10-03", "2026-10-10", "2026-10-17", "2026-10-24", "2026-10-31"];

  it("has no rate when there are no session dates", () => {
    expect(summarizeAttendanceOnDates({ "2026-10-03": "present" }, [])).toMatchObject({
      total: 0,
      rate: null,
    });
  });

  it("has no rate when none of the sessions are marked yet", () => {
    expect(summarizeAttendanceOnDates({}, october)).toMatchObject({ total: 0, rate: null });
  });

  it("leaves unmarked sessions out of the rate", () => {
    const summary = summarizeAttendanceOnDates(
      { "2026-10-03": "present", "2026-10-10": "absent" },
      october,
    );
    expect(summary).toMatchObject({ present: 1, absent: 1, total: 2, rate: 0.5 });
  });

  it("ignores marks on dates outside the given sessions", () => {
    const summary = summarizeAttendanceOnDates(
      { "2026-09-26": "absent", "2026-10-03": "present", "2026-11-07": "absent" },
      october,
    );
    expect(summary).toMatchObject({ present: 1, absent: 0, total: 1, rate: 1 });
  });

  it("counts late as attended across a full month", () => {
    const summary = summarizeAttendanceOnDates(
      {
        "2026-10-03": "present",
        "2026-10-10": "late",
        "2026-10-17": "absent",
        "2026-10-24": "present",
        "2026-10-31": "late",
      },
      october,
    );
    expect(summary).toEqual({ present: 2, late: 2, absent: 1, total: 5, rate: 0.8 });
  });
});

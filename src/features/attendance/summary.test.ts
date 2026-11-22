import { describe, expect, it } from "vitest";
import { summarizeAttendance, summarizeAttendanceByClass, type AttendanceStatus } from "./summary";

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

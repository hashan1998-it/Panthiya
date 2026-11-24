import { describe, expect, it } from "vitest";
import { attendanceSchema, type AttendanceValues } from "./schema";

const CLASS_ID = "fde58370-a954-dd87-7e7f-87a652938d35";
const STUDENT_A = "0505c399-09c4-1861-08d1-ff7e6623890a";
const STUDENT_B = "8e1011fc-7911-2f3a-4a0a-4bf7d6b85c86";

const valid: AttendanceValues = {
  class_id: CLASS_ID,
  session_date: "2026-11-18",
  marks: [
    { student_id: STUDENT_A, status: "present" },
    { student_id: STUDENT_B, status: "late" },
  ],
};

function messages(values: AttendanceValues) {
  const result = attendanceSchema.safeParse(values);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.message);
}

describe("attendanceSchema", () => {
  it("accepts a class, a date and one mark per student", () => {
    expect(attendanceSchema.parse(valid)).toEqual(valid);
  });

  it("accepts every status", () => {
    for (const status of ["present", "absent", "late"] as const) {
      expect(messages({ ...valid, marks: [{ student_id: STUDENT_A, status }] })).toEqual([]);
    }
  });

  it("needs at least one mark", () => {
    expect(messages({ ...valid, marks: [] })).toEqual(["noMarks"]);
  });

  it("rejects two marks for the same student", () => {
    expect(
      messages({
        ...valid,
        marks: [
          { student_id: STUDENT_A, status: "present" },
          { student_id: STUDENT_A, status: "absent" },
        ],
      }),
    ).toEqual(["saveFailed"]);
  });

  it("rejects a bad class id or date", () => {
    expect(messages({ ...valid, class_id: "maths" })).toEqual(["notFound"]);
    expect(messages({ ...valid, session_date: "2026-02-31" })).toEqual(["invalidDate"]);
  });

  it("rejects an unknown status", () => {
    expect(
      attendanceSchema.safeParse({
        ...valid,
        marks: [{ student_id: STUDENT_A, status: "excused" }],
      }).success,
    ).toBe(false);
  });
});

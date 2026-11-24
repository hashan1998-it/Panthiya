import { describe, expect, it } from "vitest";
import { enrollSchema, type EnrollFormValues } from "./enrollment-schema";

const STUDENT_A = "0505c399-09c4-1861-08d1-ff7e6623890a";
const STUDENT_B = "8e1011fc-7911-2f3a-4a0a-4bf7d6b85c86";

function issues(values: EnrollFormValues) {
  const result = enrollSchema.safeParse(values);
  if (result.success) return [];
  return result.error.issues.map(({ path, message }) => ({ path, message }));
}

describe("enrollSchema", () => {
  it("sets the percent from the discount type", () => {
    const result = enrollSchema.parse({
      enrollments: [
        { student_id: STUDENT_A, discount_type: "none", discount_percent: "" },
        { student_id: STUDENT_B, discount_type: "half", discount_percent: "" },
      ],
    });
    expect(result.enrollments).toEqual([
      { student_id: STUDENT_A, discount_type: "none", discount_percent: 0 },
      { student_id: STUDENT_B, discount_type: "half", discount_percent: 50 },
    ]);
  });

  it("ignores a typed percent unless the discount is custom", () => {
    const result = enrollSchema.parse({
      enrollments: [{ student_id: STUDENT_A, discount_type: "free", discount_percent: "30" }],
    });
    expect(result.enrollments[0].discount_percent).toBe(100);
  });

  it("uses the typed percent for a custom discount", () => {
    const result = enrollSchema.parse({
      enrollments: [{ student_id: STUDENT_A, discount_type: "custom", discount_percent: " 25 " }],
    });
    expect(result.enrollments[0]).toEqual({
      student_id: STUDENT_A,
      discount_type: "custom",
      discount_percent: 25,
    });
  });

  it("needs a whole custom percent from 1 to 99", () => {
    for (const percent of ["", "0", "100", "12.5", "-5", "abc"]) {
      expect(
        issues({
          enrollments: [
            { student_id: STUDENT_A, discount_type: "none", discount_percent: "" },
            { student_id: STUDENT_B, discount_type: "custom", discount_percent: percent },
          ],
        }),
      ).toEqual([{ path: ["enrollments", 1, "discount_percent"], message: "percentInvalid" }]);
    }
  });

  it("needs at least one student", () => {
    expect(issues({ enrollments: [] })).toEqual([
      { path: ["enrollments"], message: "selectStudents" },
    ]);
  });

  it("rejects an unknown discount type or student id", () => {
    expect(
      enrollSchema.safeParse({
        enrollments: [{ student_id: "nope", discount_type: "none", discount_percent: "" }],
      }).success,
    ).toBe(false);
    expect(
      enrollSchema.safeParse({
        enrollments: [
          { student_id: STUDENT_A, discount_type: "quarter" as "none", discount_percent: "" },
        ],
      }).success,
    ).toBe(false);
  });
});

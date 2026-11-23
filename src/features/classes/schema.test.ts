import { describe, expect, it } from "vitest";
import { z } from "zod";
import { classSchema, type ClassFormValues } from "./schema";

const valid: ClassFormValues = {
  subject: "  Maths ",
  grade: "10",
  day_of_week: "6",
  start_time: "08:00",
  end_time: "10:00",
  monthly_fee: "2,500",
};

function fieldErrors(values: ClassFormValues) {
  const result = classSchema.safeParse(values);
  if (result.success) return {};
  return z.flattenError(result.error).fieldErrors;
}

describe("classSchema", () => {
  it("cleans up a valid class", () => {
    expect(classSchema.parse(valid)).toEqual({
      subject: "Maths",
      grade: 10,
      day_of_week: 6,
      start_time: "08:00",
      end_time: "10:00",
      monthly_fee: 2500,
    });
  });

  it("accepts Sunday and a fee with cents", () => {
    const result = classSchema.parse({ ...valid, day_of_week: "0", monthly_fee: "1800.50" });
    expect(result.day_of_week).toBe(0);
    expect(result.monthly_fee).toBe(1800.5);
  });

  it("needs every field", () => {
    expect(
      fieldErrors({
        subject: " ",
        grade: "",
        day_of_week: "",
        start_time: "",
        end_time: "",
        monthly_fee: "",
      }),
    ).toEqual({
      subject: ["subjectRequired"],
      grade: ["gradeRequired"],
      day_of_week: ["dayRequired"],
      start_time: ["startTimeRequired"],
      end_time: ["endTimeRequired"],
      monthly_fee: ["feeRequired"],
    });
  });

  it("limits the subject length", () => {
    expect(fieldErrors({ ...valid, subject: "S".repeat(51) })).toEqual({
      subject: ["subjectTooLong"],
    });
  });

  it("needs a grade from 1 to 13 and a day from Sunday to Saturday", () => {
    expect(fieldErrors({ ...valid, grade: "14" })).toEqual({ grade: ["gradeRequired"] });
    expect(fieldErrors({ ...valid, day_of_week: "7" })).toEqual({
      day_of_week: ["dayRequired"],
    });
  });

  it("needs the end time to be after the start time", () => {
    expect(fieldErrors({ ...valid, end_time: "08:00" })).toEqual({
      end_time: ["endTimeAfterStart"],
    });
    expect(fieldErrors({ ...valid, start_time: "15:00", end_time: "09:30" })).toEqual({
      end_time: ["endTimeAfterStart"],
    });
  });

  it("needs a positive fee written as an amount", () => {
    expect(fieldErrors({ ...valid, monthly_fee: "0" })).toEqual({
      monthly_fee: ["feePositive"],
    });
    expect(fieldErrors({ ...valid, monthly_fee: "-500" })).toEqual({
      monthly_fee: ["feeInvalid"],
    });
    expect(fieldErrors({ ...valid, monthly_fee: "Rs. 2500" })).toEqual({
      monthly_fee: ["feeInvalid"],
    });
    expect(fieldErrors({ ...valid, monthly_fee: "2500.555" })).toEqual({
      monthly_fee: ["feeInvalid"],
    });
    expect(fieldErrors({ ...valid, monthly_fee: "123456789" })).toEqual({
      monthly_fee: ["feeInvalid"],
    });
  });
});

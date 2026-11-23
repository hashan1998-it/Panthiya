import { describe, expect, it } from "vitest";
import { z } from "zod";
import { studentAccountSchema, studentSchema, type StudentFormValues } from "./schema";

const valid: StudentFormValues = {
  admission_no: "adm-0031",
  full_name: "  Nethmi Silva ",
  grade: "10",
  phone: "077 123 4567",
  parent_name: "",
  parent_phone: "",
  joined_on: "2026-11-20",
};

function fieldErrors(values: StudentFormValues) {
  const result = studentSchema.safeParse(values);
  if (result.success) return {};
  return z.flattenError(result.error).fieldErrors;
}

describe("studentSchema", () => {
  it("cleans up a valid student", () => {
    expect(studentSchema.parse(valid)).toEqual({
      admission_no: "ADM-0031",
      full_name: "Nethmi Silva",
      grade: 10,
      phone: "0771234567",
      parent_name: null,
      parent_phone: null,
      joined_on: "2026-11-20",
    });
  });

  it("accepts a parent phone when the student has none", () => {
    const result = studentSchema.parse({ ...valid, phone: "", parent_phone: "+94711234567" });
    expect(result.phone).toBeNull();
    expect(result.parent_phone).toBe("0711234567");
  });

  it("needs at least one phone number", () => {
    expect(fieldErrors({ ...valid, phone: "", parent_phone: "" })).toEqual({
      phone: ["contactRequired"],
    });
  });

  it("rejects a phone number that isn't Sri Lankan", () => {
    expect(fieldErrors({ ...valid, parent_phone: "12345" })).toEqual({
      parent_phone: ["phoneInvalid"],
    });
  });

  it("needs an admission number, a name and a joined date", () => {
    expect(fieldErrors({ ...valid, admission_no: " ", full_name: "", joined_on: "" })).toEqual({
      admission_no: ["admissionNoRequired"],
      full_name: ["fullNameRequired"],
      joined_on: ["joinedOnRequired"],
    });
  });

  it("limits the length of text fields", () => {
    expect(
      fieldErrors({
        ...valid,
        admission_no: "A".repeat(21),
        full_name: "N".repeat(101),
        parent_name: "P".repeat(101),
      }),
    ).toEqual({
      admission_no: ["admissionNoTooLong"],
      full_name: ["fullNameTooLong"],
      parent_name: ["parentNameTooLong"],
    });
  });

  it("needs a grade from 1 to 13", () => {
    expect(fieldErrors({ ...valid, grade: "" })).toEqual({ grade: ["gradeRequired"] });
    expect(fieldErrors({ ...valid, grade: "14" })).toEqual({ grade: ["gradeRequired"] });
    expect(fieldErrors({ ...valid, grade: "abc" })).toEqual({ grade: ["gradeRequired"] });
  });
});

function accountErrors(email: string) {
  const result = studentAccountSchema.safeParse({ email });
  if (result.success) return {};
  return z.flattenError(result.error).fieldErrors;
}

describe("studentAccountSchema", () => {
  it("trims and lowercases a valid email", () => {
    expect(studentAccountSchema.parse({ email: "  Nethmi.Silva@Example.com " })).toEqual({
      email: "nethmi.silva@example.com",
    });
  });

  it("rejects an empty or invalid email", () => {
    expect(accountErrors("")).toEqual({ email: ["emailInvalid"] });
    expect(accountErrors("   ")).toEqual({ email: ["emailInvalid"] });
    expect(accountErrors("nethmi")).toEqual({ email: ["emailInvalid"] });
    expect(accountErrors("nethmi@")).toEqual({ email: ["emailInvalid"] });
  });

  it("rejects an email longer than 254 characters", () => {
    const email = `${"a".repeat(64)}@${"b".repeat(60)}.${"c".repeat(60)}.${"d".repeat(63)}.com`;
    expect(email).toHaveLength(254);
    expect(accountErrors(email)).toEqual({});
    expect(accountErrors(`a${email}`)).toEqual({ email: ["emailTooLong"] });
  });
});

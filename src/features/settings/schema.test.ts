import { describe, expect, it } from "vitest";
import { changePasswordSchema, type ChangePasswordValues } from "./schema";

const valid: ChangePasswordValues = {
  current: "Demo-Pass-2026",
  next: "New-Pass-2027",
  confirm: "New-Pass-2027",
};

function errors(values: Partial<ChangePasswordValues>) {
  const result = changePasswordSchema.safeParse({ ...valid, ...values });
  if (result.success) return {};
  return Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message]));
}

describe("changePasswordSchema", () => {
  it("accepts a new password that is long enough and confirmed", () => {
    expect(errors({})).toEqual({});
  });

  it("needs the current password", () => {
    expect(errors({ current: "" })).toEqual({ current: "currentRequired" });
  });

  it("needs 8 to 72 characters", () => {
    expect(errors({ next: "short1!", confirm: "short1!" })).toEqual({ next: "tooShort" });
    expect(errors({ next: "a".repeat(8), confirm: "a".repeat(8) })).toEqual({});
    const long = "a".repeat(73);
    expect(errors({ next: long, confirm: long })).toEqual({ next: "tooLong" });
  });

  it("needs the confirmation to match", () => {
    expect(errors({ confirm: "New-Pass-2028" })).toEqual({ confirm: "mismatch" });
  });

  it("needs a password different from the current one", () => {
    expect(errors({ next: valid.current, confirm: valid.current })).toEqual({
      next: "sameAsCurrent",
    });
  });
});

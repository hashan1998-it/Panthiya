import { describe, expect, it } from "vitest";
import {
  generateTempPassword,
  TEMP_PASSWORD_ALPHABET,
  TEMP_PASSWORD_LENGTH,
} from "./temp-password";

describe("generateTempPassword", () => {
  it("has the default length", () => {
    expect(generateTempPassword()).toHaveLength(TEMP_PASSWORD_LENGTH);
  });

  it("accepts a custom length", () => {
    expect(generateTempPassword(20)).toHaveLength(20);
  });

  it("only uses characters from the alphabet", () => {
    const password = generateTempPassword(500);
    for (const char of password) {
      expect(TEMP_PASSWORD_ALPHABET).toContain(char);
    }
  });

  it("leaves out characters that are easy to mix up", () => {
    expect(TEMP_PASSWORD_ALPHABET).not.toMatch(/[0O1lI]/);
  });

  it("gives a different password each time", () => {
    const passwords = new Set(Array.from({ length: 50 }, () => generateTempPassword()));
    expect(passwords.size).toBe(50);
  });
});

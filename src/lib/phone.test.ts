import { describe, expect, it } from "vitest";
import { normalizeSriLankanPhone } from "./phone";

describe("normalizeSriLankanPhone", () => {
  it("accepts a 10-digit local number", () => {
    expect(normalizeSriLankanPhone("0771234567")).toBe("0771234567");
    expect(normalizeSriLankanPhone("0112345678")).toBe("0112345678");
  });

  it("ignores spaces, dashes, dots and brackets", () => {
    expect(normalizeSriLankanPhone("077 123 4567")).toBe("0771234567");
    expect(normalizeSriLankanPhone("077-123-4567")).toBe("0771234567");
    expect(normalizeSriLankanPhone("(011) 234.5678")).toBe("0112345678");
  });

  it("turns +94, 0094 and 94 into a leading 0", () => {
    expect(normalizeSriLankanPhone("+94771234567")).toBe("0771234567");
    expect(normalizeSriLankanPhone("+94 77 123 4567")).toBe("0771234567");
    expect(normalizeSriLankanPhone("0094771234567")).toBe("0771234567");
    expect(normalizeSriLankanPhone("94771234567")).toBe("0771234567");
  });

  it("rejects numbers with the wrong length", () => {
    expect(normalizeSriLankanPhone("077123456")).toBeNull();
    expect(normalizeSriLankanPhone("07712345678")).toBeNull();
    expect(normalizeSriLankanPhone("+9477123456")).toBeNull();
  });

  it("rejects numbers that don't start like a Sri Lankan number", () => {
    expect(normalizeSriLankanPhone("7712345678")).toBeNull();
    expect(normalizeSriLankanPhone("0071234567")).toBeNull();
    expect(normalizeSriLankanPhone("+44771234567")).toBeNull();
  });

  it("rejects letters and empty input", () => {
    expect(normalizeSriLankanPhone("077abc4567")).toBeNull();
    expect(normalizeSriLankanPhone("")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { isLocale, LOCALES, toLocale } from "./locale";

describe("locale", () => {
  it("supports English and Sinhala", () => {
    expect(LOCALES).toEqual(["en", "si"]);
  });

  it("recognises only supported locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("si")).toBe(true);
    expect(isLocale("ta")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it("falls back to English for anything else", () => {
    expect(toLocale("si")).toBe("si");
    expect(toLocale("SI")).toBe("en");
    expect(toLocale(undefined)).toBe("en");
  });
});

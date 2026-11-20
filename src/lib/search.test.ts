import { describe, expect, it } from "vitest";
import { toContainsPattern } from "./search";

describe("toContainsPattern", () => {
  it("wraps plain text in % and double quotes", () => {
    expect(toContainsPattern("nimal")).toBe('"%nimal%"');
  });

  it("keeps commas and brackets inside the quotes", () => {
    expect(toContainsPattern("a,b(c)")).toBe('"%a,b(c)%"');
  });

  it("escapes LIKE wildcards so they match literally", () => {
    expect(toContainsPattern("50%")).toBe(String.raw`"%50\\%%"`);
    expect(toContainsPattern("a_b")).toBe(String.raw`"%a\\_b%"`);
  });

  it("escapes double quotes and backslashes", () => {
    expect(toContainsPattern('say "hi"')).toBe(String.raw`"%say \"hi\"%"`);
    expect(toContainsPattern(String.raw`a\b`)).toBe(String.raw`"%a\\\\b%"`);
  });
});

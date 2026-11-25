import { describe, expect, it } from "vitest";
import { isMonth, listRecentMonths, MONTH_COUNT, pickMonth } from "./months";

const TUESDAY = "2026-11-24";

describe("listRecentMonths", () => {
  it("lists months back from the current one, across a year", () => {
    expect(listRecentMonths("2026-02-15", 4)).toEqual(["2026-02", "2026-01", "2025-12", "2025-11"]);
  });

  it("lists twelve months by default", () => {
    const months = listRecentMonths(TUESDAY);
    expect(months).toHaveLength(MONTH_COUNT);
    expect(months.at(0)).toBe("2026-11");
    expect(months.at(-1)).toBe("2025-12");
  });
});

describe("isMonth", () => {
  it("accepts YYYY-MM only", () => {
    expect(isMonth("2026-11")).toBe(true);
    expect(isMonth("2026-1")).toBe(false);
    expect(isMonth("2026-00")).toBe(false);
    expect(isMonth("2026-11-01")).toBe(false);
  });
});

describe("pickMonth", () => {
  it("keeps a month from the selector", () => {
    expect(pickMonth("2026-10", TUESDAY)).toBe("2026-10");
    expect(pickMonth("2025-12", TUESDAY)).toBe("2025-12");
  });

  it("falls back to the current month for anything else", () => {
    expect(pickMonth(undefined, TUESDAY)).toBe("2026-11");
    expect(pickMonth("2026-12", TUESDAY)).toBe("2026-11");
    expect(pickMonth("2025-11", TUESDAY)).toBe("2026-11");
    expect(pickMonth("oops", TUESDAY)).toBe("2026-11");
  });
});

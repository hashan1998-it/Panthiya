import { describe, expect, it } from "vitest";
import { isSessionDate, listSessionDates, SESSION_DATE_COUNT } from "./session-dates";

const TUESDAY = "2026-11-24";

describe("listSessionDates", () => {
  it("starts with today when the class is on today's weekday", () => {
    expect(listSessionDates(2, TUESDAY, 3)).toEqual(["2026-11-24", "2026-11-17", "2026-11-10"]);
  });

  it("starts with the latest past session for other weekdays", () => {
    expect(listSessionDates(3, TUESDAY, 2)).toEqual(["2026-11-18", "2026-11-11"]);
    expect(listSessionDates(0, TUESDAY, 2)).toEqual(["2026-11-22", "2026-11-15"]);
    expect(listSessionDates(1, TUESDAY, 1)).toEqual(["2026-11-23"]);
  });

  it("goes back across months and years", () => {
    expect(listSessionDates(3, "2026-01-02", 3)).toEqual([
      "2025-12-31",
      "2025-12-24",
      "2025-12-17",
    ]);
  });

  it("lists twelve weeks by default", () => {
    const dates = listSessionDates(6, TUESDAY);
    expect(dates).toHaveLength(SESSION_DATE_COUNT);
    expect(dates.at(0)).toBe("2026-11-21");
    expect(dates.at(-1)).toBe("2026-09-05");
  });
});

describe("isSessionDate", () => {
  it("accepts a past or current date on the class weekday", () => {
    expect(isSessionDate("2026-11-24", 2, TUESDAY)).toBe(true);
    expect(isSessionDate("2026-10-06", 2, TUESDAY)).toBe(true);
  });

  it("rejects a future date", () => {
    expect(isSessionDate("2026-12-01", 2, TUESDAY)).toBe(false);
  });

  it("rejects another weekday", () => {
    expect(isSessionDate("2026-11-23", 2, TUESDAY)).toBe(false);
  });

  it("rejects something that isn't a real date", () => {
    expect(isSessionDate("2026-02-31", 2, TUESDAY)).toBe(false);
    expect(isSessionDate("next tuesday", 2, TUESDAY)).toBe(false);
    expect(isSessionDate("", 2, TUESDAY)).toBe(false);
  });
});

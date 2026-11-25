import { describe, expect, it } from "vitest";
import {
  isSessionDate,
  listMonthSessionDates,
  listSessionDates,
  SESSION_DATE_COUNT,
} from "./session-dates";

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

describe("listMonthSessionDates", () => {
  it("lists every class day in a past month, oldest first", () => {
    expect(listMonthSessionDates(6, "2026-10", TUESDAY)).toEqual([
      "2026-10-03",
      "2026-10-10",
      "2026-10-17",
      "2026-10-24",
      "2026-10-31",
    ]);
    expect(listMonthSessionDates(0, "2026-02", TUESDAY)).toEqual([
      "2026-02-01",
      "2026-02-08",
      "2026-02-15",
      "2026-02-22",
    ]);
  });

  it("stops at today in the current month", () => {
    expect(listMonthSessionDates(2, "2026-11", TUESDAY)).toEqual([
      "2026-11-03",
      "2026-11-10",
      "2026-11-17",
      "2026-11-24",
    ]);
    expect(listMonthSessionDates(3, "2026-11", TUESDAY)).toEqual([
      "2026-11-04",
      "2026-11-11",
      "2026-11-18",
    ]);
  });

  it("includes 29 February in a leap year", () => {
    expect(listMonthSessionDates(2, "2028-02", "2028-03-10")).toEqual([
      "2028-02-01",
      "2028-02-08",
      "2028-02-15",
      "2028-02-22",
      "2028-02-29",
    ]);
  });

  it("stops at 28 February in a normal year", () => {
    expect(listMonthSessionDates(0, "2027-02", "2027-03-10")).toEqual([
      "2027-02-07",
      "2027-02-14",
      "2027-02-21",
      "2027-02-28",
    ]);
  });

  it("starts on the 1st when the month begins on the class day", () => {
    expect(listMonthSessionDates(2, "2026-12", "2026-12-31")).toEqual([
      "2026-12-01",
      "2026-12-08",
      "2026-12-15",
      "2026-12-22",
      "2026-12-29",
    ]);
  });

  it("has only today, or nothing, on the 1st of the month", () => {
    expect(listMonthSessionDates(2, "2026-12", "2026-12-01")).toEqual(["2026-12-01"]);
    expect(listMonthSessionDates(3, "2026-12", "2026-12-01")).toEqual([]);
  });

  it("returns nothing for a future month or a bad month", () => {
    expect(listMonthSessionDates(2, "2026-12", TUESDAY)).toEqual([]);
    expect(listMonthSessionDates(2, "2026-13", TUESDAY)).toEqual([]);
    expect(listMonthSessionDates(2, "november", TUESDAY)).toEqual([]);
  });
});

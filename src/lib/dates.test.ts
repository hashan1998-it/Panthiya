import { describe, expect, it } from "vitest";
import { getCurrentMonth, getToday } from "./dates";

// Sri Lanka is UTC+05:30 all year (no daylight saving).
// So Sri Lankan midnight is 18:30 UTC on the day before.

describe("getToday", () => {
  it("at midnight UTC it is already 05:30 the same day in Sri Lanka", () => {
    expect(getToday(new Date("2026-11-19T00:00:00Z"))).toBe("2026-11-19");
  });

  it("one second before Sri Lankan midnight it is still the old day", () => {
    expect(getToday(new Date("2026-11-18T18:29:59Z"))).toBe("2026-11-18");
  });

  it("at Sri Lankan midnight the day changes, even though UTC is still on the old day", () => {
    expect(getToday(new Date("2026-11-18T18:30:00Z"))).toBe("2026-11-19");
  });
});

describe("getCurrentMonth", () => {
  it("stays on the old month one second before Sri Lankan midnight", () => {
    expect(getCurrentMonth(new Date("2026-11-30T18:29:59Z"))).toBe("2026-11");
  });

  it("moves to the next month at Sri Lankan midnight", () => {
    expect(getCurrentMonth(new Date("2026-11-30T18:30:00Z"))).toBe("2026-12");
  });

  it("moves to the next year on New Year's Eve at 18:30 UTC", () => {
    expect(getCurrentMonth(new Date("2026-12-31T18:30:00Z"))).toBe("2027-01");
  });
});

import { describe, expect, it } from "vitest";
import { DAYS_OF_WEEK, formatWeekday } from "./schedule";

describe("formatWeekday", () => {
  it("names every day from Sunday (0) to Saturday (6)", () => {
    expect(DAYS_OF_WEEK.map((day) => formatWeekday(day, "en"))).toEqual([
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ]);
  });
});

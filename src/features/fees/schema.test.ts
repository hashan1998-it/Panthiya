import { describe, expect, it } from "vitest";
import { generateDuesSchema, getMonthBounds, listDueMonths, pickDueMonth } from "./schema";

const TODAY = "2026-11-25";

describe("listDueMonths", () => {
  it("starts with next month, then this month and the eleven before it", () => {
    const months = listDueMonths(TODAY);
    expect(months).toHaveLength(13);
    expect(months.slice(0, 3)).toEqual(["2026-12", "2026-11", "2026-10"]);
    expect(months.at(-1)).toBe("2025-12");
  });

  it("rolls next month over into the new year", () => {
    expect(listDueMonths("2026-12-31").slice(0, 2)).toEqual(["2027-01", "2026-12"]);
  });
});

describe("pickDueMonth", () => {
  it("keeps a month from the list, including next month", () => {
    expect(pickDueMonth("2026-12", TODAY)).toBe("2026-12");
    expect(pickDueMonth("2025-12", TODAY)).toBe("2025-12");
  });

  it("falls back to the current month for anything else", () => {
    expect(pickDueMonth(undefined, TODAY)).toBe("2026-11");
    expect(pickDueMonth("2027-01", TODAY)).toBe("2026-11");
    expect(pickDueMonth("2025-11", TODAY)).toBe("2026-11");
    expect(pickDueMonth("oops", TODAY)).toBe("2026-11");
  });
});

describe("getMonthBounds", () => {
  it("returns the first and last day of the month", () => {
    expect(getMonthBounds("2026-11")).toEqual({ first: "2026-11-01", last: "2026-11-30" });
    expect(getMonthBounds("2026-12")).toEqual({ first: "2026-12-01", last: "2026-12-31" });
  });

  it("handles February in leap and normal years", () => {
    expect(getMonthBounds("2028-02").last).toBe("2028-02-29");
    expect(getMonthBounds("2027-02").last).toBe("2027-02-28");
  });
});

describe("generateDuesSchema", () => {
  const schema = generateDuesSchema(TODAY);

  it("accepts a month from the list", () => {
    expect(schema.parse({ month: "2026-12" })).toEqual({ month: "2026-12" });
  });

  it("rejects a month outside the list or in the wrong format", () => {
    for (const month of ["2027-01", "2025-11", "2026-11-01", ""]) {
      const result = schema.safeParse({ month });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe("invalidMonth");
    }
  });
});

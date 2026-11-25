import { describe, expect, it } from "vitest";
import { fillIncomeMonths } from "./income";

describe("fillIncomeMonths", () => {
  it("lists the last six months, oldest first, with 0 for months without payments", () => {
    expect(
      fillIncomeMonths("2026-11-25", [
        { month: "2026-10-01", collected: 117730 },
        { month: "2026-11-01", collected: 72090 },
      ]),
    ).toEqual([
      { month: "2026-06", collected: 0 },
      { month: "2026-07", collected: 0 },
      { month: "2026-08", collected: 0 },
      { month: "2026-09", collected: 0 },
      { month: "2026-10", collected: 117730 },
      { month: "2026-11", collected: 72090 },
    ]);
  });

  it("goes back across a year boundary", () => {
    expect(fillIncomeMonths("2027-02-01", [], 4).map((row) => row.month)).toEqual([
      "2026-11",
      "2026-12",
      "2027-01",
      "2027-02",
    ]);
  });

  it("ignores months outside the range and empty rows", () => {
    expect(
      fillIncomeMonths(
        "2026-11-25",
        [
          { month: "2026-12-01", collected: 500 },
          { month: "2025-11-01", collected: 500 },
          { month: null, collected: 500 },
          { month: "2026-11-01", collected: null },
        ],
        2,
      ),
    ).toEqual([
      { month: "2026-10", collected: 0 },
      { month: "2026-11", collected: 0 },
    ]);
  });
});

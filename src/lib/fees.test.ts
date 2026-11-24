import { describe, expect, it } from "vitest";
import { calculateAmountDue } from "./fees";

describe("calculateAmountDue", () => {
  it("charges the full fee with no discount", () => {
    expect(calculateAmountDue(2500, 0)).toBe(2500);
    expect(calculateAmountDue(1800.5, 0)).toBe(1800.5);
  });

  it("charges half with a half card", () => {
    expect(calculateAmountDue(2500, 50)).toBe(1250);
    expect(calculateAmountDue(1855, 50)).toBe(927.5);
  });

  it("charges nothing with a free card", () => {
    expect(calculateAmountDue(2500, 100)).toBe(0);
    expect(calculateAmountDue(1999.99, 100)).toBe(0);
  });

  it("takes a custom percent off", () => {
    expect(calculateAmountDue(2500, 20)).toBe(2000);
    expect(calculateAmountDue(2500, 1)).toBe(2475);
    expect(calculateAmountDue(2500, 99)).toBe(25);
  });

  it("keeps the fee exactly at 0% and returns exactly zero at 100%", () => {
    expect(calculateAmountDue(1234.56, 0)).toBe(1234.56);
    expect(calculateAmountDue(1234.56, 100)).toBe(0);
  });

  it("rounds to the nearest cent", () => {
    expect(calculateAmountDue(1850, 33)).toBe(1239.5);
    expect(calculateAmountDue(1999.99, 33)).toBe(1339.99);
    expect(calculateAmountDue(1800.1, 10)).toBe(1620.09);
  });

  it("rounds half a cent up", () => {
    expect(calculateAmountDue(0.05, 50)).toBe(0.03);
    expect(calculateAmountDue(1855.55, 50)).toBe(927.78);
  });

  it("is not thrown off by fees that are not exact in binary", () => {
    expect(calculateAmountDue(0.29, 50)).toBe(0.15);
    expect(calculateAmountDue(1.1, 50)).toBe(0.55);
    expect(calculateAmountDue(3200.5, 50)).toBe(1600.25);
  });
});

import { describe, expect, it } from "vitest";
import { calculateAmountDue } from "./fees";

describe("calculateAmountDue", () => {
  it("takes the discount off the monthly fee", () => {
    expect(calculateAmountDue(2500, 0)).toBe(2500);
    expect(calculateAmountDue(2500, 50)).toBe(1250);
    expect(calculateAmountDue(2500, 100)).toBe(0);
    expect(calculateAmountDue(2500, 20)).toBe(2000);
  });

  it("rounds a custom discount to the nearest cent", () => {
    expect(calculateAmountDue(1850, 33)).toBe(1239.5);
    expect(calculateAmountDue(1999.99, 33)).toBe(1339.99);
    expect(calculateAmountDue(0.05, 50)).toBe(0.03);
  });

  it("keeps a fee that already has cents exact", () => {
    expect(calculateAmountDue(3200.5, 50)).toBe(1600.25);
    expect(calculateAmountDue(1800.1, 10)).toBe(1620.09);
  });
});

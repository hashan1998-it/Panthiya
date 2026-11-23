import { describe, expect, it } from "vitest";
import { effectiveFee, formatFee } from "./money";

describe("formatFee", () => {
  it("shows rupees with a thousands separator and two decimals", () => {
    expect(formatFee(2500)).toBe("Rs. 2,500.00");
    expect(formatFee(84500)).toBe("Rs. 84,500.00");
    expect(formatFee(1250000)).toBe("Rs. 1,250,000.00");
  });

  it("keeps cents and rounds to two decimals", () => {
    expect(formatFee(1250.5)).toBe("Rs. 1,250.50");
    expect(formatFee(99.999)).toBe("Rs. 100.00");
  });

  it("shows zero", () => {
    expect(formatFee(0)).toBe("Rs. 0.00");
  });
});

describe("effectiveFee", () => {
  it("takes the discount off the monthly fee", () => {
    expect(effectiveFee(2500, 0)).toBe(2500);
    expect(effectiveFee(2500, 50)).toBe(1250);
    expect(effectiveFee(2500, 100)).toBe(0);
    expect(effectiveFee(2500, 20)).toBe(2000);
  });

  it("rounds a custom discount to the nearest cent", () => {
    expect(effectiveFee(1850, 33)).toBe(1239.5);
    expect(effectiveFee(1999.99, 33)).toBe(1339.99);
    expect(effectiveFee(0.05, 50)).toBe(0.03);
  });

  it("keeps a fee that already has cents exact", () => {
    expect(effectiveFee(3200.5, 50)).toBe(1600.25);
    expect(effectiveFee(1800.1, 10)).toBe(1620.09);
  });
});

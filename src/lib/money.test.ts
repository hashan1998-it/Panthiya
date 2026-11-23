import { describe, expect, it } from "vitest";
import { formatFee } from "./money";

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

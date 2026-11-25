import { describe, expect, it } from "vitest";
import { paymentSchema, type PaymentFormValues } from "./payment-schema";

const DUE_ID = "0505c399-09c4-1861-08d1-ff7e6623890a";
const schema = paymentSchema({ balance: 2500, today: "2026-11-25" });

const valid: PaymentFormValues = {
  due_id: DUE_ID,
  amount: "2500",
  paid_on: "2026-11-25",
  method: "cash",
};

function messages(values: Partial<PaymentFormValues>) {
  const result = schema.safeParse({ ...valid, ...values });
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.message);
}

describe("paymentSchema", () => {
  it("accepts the full balance and turns the amount into a number", () => {
    expect(schema.parse(valid)).toEqual({ ...valid, amount: 2500 });
  });

  it("accepts less than the balance, cents and commas", () => {
    expect(schema.parse({ ...valid, amount: "1,250.50" }).amount).toBe(1250.5);
  });

  it("accepts a past date and both methods", () => {
    expect(messages({ paid_on: "2026-10-01", method: "bank_transfer" })).toEqual([]);
  });

  it("rejects a missing, badly written or zero amount", () => {
    expect(messages({ amount: " " })).toEqual(["amountRequired"]);
    expect(messages({ amount: "12.345" })).toEqual(["amountInvalid"]);
    expect(messages({ amount: "-5" })).toEqual(["amountInvalid"]);
    expect(messages({ amount: "0" })).toEqual(["amountPositive"]);
  });

  it("rejects more than the balance", () => {
    expect(messages({ amount: "2500.01" })).toEqual(["amountTooHigh"]);
  });

  it("rejects a future or invalid date", () => {
    expect(messages({ paid_on: "2026-11-26" })).toEqual(["dateInFuture"]);
    expect(messages({ paid_on: "2026-02-30" })).toEqual(["dateInvalid"]);
  });

  it("rejects an unknown method", () => {
    expect(messages({ method: "card" as PaymentFormValues["method"] })).toEqual(["methodRequired"]);
  });
});

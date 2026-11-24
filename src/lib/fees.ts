export function calculateAmountDue(monthlyFee: number, discountPercent: number): number {
  const feeCents = Math.round(monthlyFee * 100);
  return Math.round((feeCents * (100 - discountPercent)) / 100) / 100;
}

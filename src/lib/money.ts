const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatFee(amount: number): string {
  return `Rs. ${amountFormatter.format(amount)}`;
}

export function effectiveFee(monthlyFee: number, discountPercent: number): number {
  const feeCents = Math.round(monthlyFee * 100);
  return Math.round((feeCents * (100 - discountPercent)) / 100) / 100;
}

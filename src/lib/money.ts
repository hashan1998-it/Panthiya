const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatFee(amount: number): string {
  return `Rs. ${amountFormatter.format(amount)}`;
}

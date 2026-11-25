import { DEFAULT_LOCALE, type AppLocale } from "./locale";

const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const CURRENCY_PREFIX: Record<AppLocale, string> = {
  en: "Rs.",
  si: "රු.",
};

export function formatFee(amount: number, locale: AppLocale = DEFAULT_LOCALE): string {
  return `${CURRENCY_PREFIX[locale]} ${amountFormatter.format(amount)}`;
}

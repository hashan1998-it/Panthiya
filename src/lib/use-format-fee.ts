import { useCallback } from "react";
import { useLocale } from "next-intl";
import { toLocale } from "./locale";
import { formatFee } from "./money";

export function useFormatFee() {
  const locale = toLocale(useLocale());
  return useCallback((amount: number) => formatFee(amount, locale), [locale]);
}

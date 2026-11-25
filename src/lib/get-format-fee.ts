import { getLocale } from "next-intl/server";
import { toLocale } from "./locale";
import { formatFee } from "./money";

export async function getFormatFee() {
  const locale = toLocale(await getLocale());
  return (amount: number) => formatFee(amount, locale);
}

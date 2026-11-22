import type { Formats } from "next-intl";

export const formats = {
  number: {
    money: {
      style: "currency",
      currency: "LKR",
      currencyDisplay: "narrowSymbol",
    },
  },
} satisfies Formats;

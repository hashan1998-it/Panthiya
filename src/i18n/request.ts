import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { TIME_ZONE } from "@/lib/dates";
import { LOCALE_COOKIE, toLocale } from "@/lib/locale";

export default getRequestConfig(async () => {
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);

  return {
    locale,
    timeZone: TIME_ZONE,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

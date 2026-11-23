import { getRequestConfig } from "next-intl/server";
import { TIME_ZONE } from "@/lib/dates";

export default getRequestConfig(async () => {
  const locale = "en";

  return {
    locale,
    timeZone: TIME_ZONE,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

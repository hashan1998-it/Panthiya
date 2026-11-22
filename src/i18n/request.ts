import { getRequestConfig } from "next-intl/server";
import { TIME_ZONE } from "@/lib/dates";
import { formats } from "./formats";

export default getRequestConfig(async () => {
  const locale = "en";

  return {
    locale,
    timeZone: TIME_ZONE,
    formats,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

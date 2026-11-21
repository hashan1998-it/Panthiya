import type { formats } from "./i18n/formats";
import type en from "./messages/en.json";

declare module "next-intl" {
  interface AppConfig {
    Messages: typeof en;
    Formats: typeof formats;
  }
}

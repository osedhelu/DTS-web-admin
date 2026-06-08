import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";

export function getLocaleFromAcceptLanguage(header: string | null): Locale {
  if (!header) {
    return defaultLocale;
  }

  const languages = new Negotiator({
    headers: { "accept-language": header },
  }).languages();

  const matched = match(languages, [...locales], defaultLocale);
  return matched.startsWith("en") ? "en" : "es";
}

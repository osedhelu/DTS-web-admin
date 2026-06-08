import "server-only";

import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-types";

const dictionaries = {
  es: () => import("@/messages/es.json").then((module) => module.default as Dictionary),
  en: () => import("@/messages/en.json").then((module) => module.default as Dictionary),
} satisfies Record<Locale, () => Promise<Dictionary>>;

export type { Dictionary } from "@/lib/i18n/dictionary-types";

export function hasLocale(locale: string): locale is Locale {
  return isLocale(locale);
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}

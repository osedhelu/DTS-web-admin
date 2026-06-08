"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { localeLabels, locales, type Locale } from "@/lib/i18n/config";

interface LocaleSwitcherProps {
  currentLocale: Locale;
}

export function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const pathname = usePathname();

  function hrefFor(locale: Locale): string {
    const segments = pathname.split("/");
    if (segments.length > 1 && locales.includes(segments[1] as Locale)) {
      segments[1] = locale;
      return segments.join("/") || `/${locale}`;
    }
    return `/${locale}`;
  }

  return (
    <div
      data-testid="locale-switcher"
      className="flex rounded-lg border border-zinc-200 bg-white p-0.5 text-xs font-medium"
      role="group"
      aria-label="Language"
    >
      {locales.map((locale) => (
        <Link
          key={locale}
          href={hrefFor(locale)}
          data-testid={`locale-${locale}`}
          className={`rounded-md px-2.5 py-1 transition-colors ${
            locale === currentLocale
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          {localeLabels[locale]}
        </Link>
      ))}
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";

import { LocaleSwitcher } from "@/features/marketing/components/LocaleSwitcher";
import type { Locale } from "@/lib/i18n/config";

interface LegalPageShellProps {
  locale: Locale;
  brand: string;
  title: string;
  intro?: string;
  backLabel: string;
  children: ReactNode;
}

export function LegalPageShell({
  locale,
  brand,
  title,
  intro,
  backLabel,
  children,
}: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href={`/${locale}`} className="font-semibold text-white">
            {brand}
          </Link>
          <LocaleSwitcher currentLocale={locale} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        {intro ? <p className="mt-4 text-zinc-400">{intro}</p> : null}
        {children}
        <Link
          href={`/${locale}`}
          className="mt-12 inline-flex text-sm font-medium text-emerald-400 hover:underline"
        >
          ← {backLabel}
        </Link>
      </main>
    </div>
  );
}

interface LegalSection {
  title: string;
  paragraphs: string[];
}

export function LegalSections({ sections }: { sections: LegalSection[] }) {
  return (
    <>
      {sections.map((section) => (
        <section key={section.title} className="mt-12">
          <h2 className="text-xl font-semibold text-white">{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 48)}
              className="mt-3 text-sm leading-relaxed text-zinc-400"
            >
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </>
  );
}

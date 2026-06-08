import Link from "next/link";
import { notFound } from "next/navigation";

import { LocaleSwitcher } from "@/features/marketing/components/LocaleSwitcher";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { locales, type Locale } from "@/lib/i18n/config";

interface LicensesPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LicensesPage({ params }: LicensesPageProps) {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang as Locale);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href={`/${lang}`} className="font-semibold text-white">
            {dict.nav.brand}
          </Link>
          <LocaleSwitcher currentLocale={lang as Locale} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold text-white">{dict.licenses.title}</h1>
        <p className="mt-4 text-zinc-400">{dict.licenses.intro}</p>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-white">{dict.licenses.platform.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            {dict.licenses.platform.content}
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-white">
            {dict.licenses.opensource.title}
          </h2>
          <ul className="mt-6 space-y-3">
            {dict.licenses.opensource.items.map((item) => (
              <li
                key={item.name}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-400 hover:underline"
                >
                  {item.name}
                </a>
                <span className="text-zinc-500">{item.license}</span>
              </li>
            ))}
          </ul>
        </section>

        <Link
          href={`/${lang}`}
          className="mt-12 inline-flex text-sm font-medium text-emerald-400 hover:underline"
        >
          ← {dict.licenses.back}
        </Link>
      </main>
    </div>
  );
}

import Link from "next/link";

import { LocaleSwitcher } from "@/features/marketing/components/LocaleSwitcher";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

interface MarketingLandingProps {
  dict: Dictionary;
  locale: Locale;
}

export function MarketingLanding({ dict, locale }: MarketingLandingProps) {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href={`/${locale}`} className="text-lg font-bold tracking-tight text-white">
            {dict.nav.brand}
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-zinc-300 md:flex">
            <a href={`/${locale}#how-it-works`} className="hover:text-white">
              {dict.nav.howItWorks}
            </a>
            <a href={`/${locale}#${dict.merchants.id}`} className="hover:text-white">
              {dict.nav.merchants}
            </a>
            <a href={`/${locale}#${dict.drivers.id}`} className="hover:text-white">
              {dict.nav.drivers}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <LocaleSwitcher currentLocale={locale} />
            <Link
              href="/login"
              className="hidden text-sm font-medium text-zinc-300 hover:text-white sm:inline"
            >
              {dict.nav.login}
            </Link>
            <Link
              href="/registro-comercio"
              className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
            >
              {dict.nav.register}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section
          data-testid="marketing-hero"
          className="relative overflow-hidden border-b border-white/10"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-zinc-950 to-zinc-950" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
            <p className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              {dict.hero.badge}
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
              {dict.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
              {dict.hero.subtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/registro-comercio"
                data-testid="marketing-cta-merchant"
                className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
              >
                {dict.hero.ctaMerchant}
              </Link>
              <a
                href={`#${dict.drivers.id}`}
                data-testid="marketing-cta-driver"
                className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
              >
                {dict.hero.ctaDriver}
              </a>
              <a
                href="#how-it-works"
                className="rounded-xl px-6 py-3 text-sm font-medium text-zinc-400 hover:text-white"
              >
                {dict.hero.ctaSecondary}
              </a>
            </div>

            <dl className="mt-16 grid gap-6 sm:grid-cols-3">
              {dict.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <dt className="text-2xl font-bold text-emerald-400">{stat.value}</dt>
                  <dd className="mt-1 text-sm text-zinc-400">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-b border-white/10 bg-zinc-900/50 py-20"
        >
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold text-white">{dict.howItWorks.title}</h2>
            <p className="mt-2 text-zinc-400">{dict.howItWorks.subtitle}</p>
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {dict.howItWorks.steps.map((step) => (
                <li
                  key={step.title}
                  className="rounded-2xl border border-white/10 bg-zinc-950 p-6"
                >
                  <h3 className="text-lg font-semibold text-emerald-400">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id={dict.merchants.id}
          data-testid="marketing-merchants"
          className="border-b border-white/10 py-20"
        >
          <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
                {dict.merchants.badge}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white">{dict.merchants.title}</h2>
              <p className="mt-4 text-zinc-400">{dict.merchants.description}</p>
              <Link
                href="/registro-comercio"
                data-testid="merchant-landing-cta"
                className="mt-8 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-100"
              >
                {dict.merchants.cta}
              </Link>
            </div>
            <ul className="space-y-3">
              {dict.merchants.features.map((feature) => (
                <li
                  key={feature}
                  className="flex gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300"
                >
                  <span className="mt-0.5 text-emerald-400" aria-hidden>
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id={dict.drivers.id}
          data-testid="marketing-drivers"
          className="border-b border-white/10 bg-zinc-900/50 py-20"
        >
          <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2 lg:items-center">
            <ul className="order-2 space-y-3 lg:order-1">
              {dict.drivers.features.map((feature) => (
                <li
                  key={feature}
                  className="flex gap-3 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-zinc-300"
                >
                  <span className="mt-0.5 text-emerald-400" aria-hidden>
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <div className="order-1 lg:order-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
                {dict.drivers.badge}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white">{dict.drivers.title}</h2>
              <p className="mt-4 text-zinc-400">{dict.drivers.description}</p>
              <p className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                {dict.drivers.note}
              </p>
              <a
                href={`mailto:drivers@dts.local?subject=${encodeURIComponent("DTS Driver — early access")}`}
                data-testid="marketing-cta-driver-contact"
                className="mt-8 inline-flex rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5"
              >
                {dict.drivers.cta}
              </a>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 py-16">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h2 className="text-2xl font-bold text-white">{dict.customers.title}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-400">{dict.customers.description}</p>
          </div>
        </section>

        <section className="border-b border-white/10 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold text-white">{dict.platform.title}</h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {dict.platform.features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-6xl rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/80 to-zinc-950 px-6 py-16 text-center sm:px-12">
            <h2 className="text-3xl font-bold text-white">{dict.cta.title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-400">{dict.cta.subtitle}</p>
            <Link
              href="/registro-comercio"
              className="mt-8 inline-flex rounded-xl bg-emerald-500 px-8 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
            >
              {dict.cta.button}
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-zinc-950 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3">
          <div>
            <p className="font-semibold text-white">{dict.nav.brand}</p>
            <p className="mt-2 text-sm text-zinc-500">{dict.footer.tagline}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-300">{dict.footer.product}</p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-500">
              <li>
                <a href={`/${locale}#${dict.merchants.id}`} className="hover:text-white">
                  {dict.footer.links.merchants}
                </a>
              </li>
              <li>
                <a href={`/${locale}#${dict.drivers.id}`} className="hover:text-white">
                  {dict.footer.links.drivers}
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-white">
                  {dict.footer.links.login}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-300">{dict.footer.legal}</p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-500">
              <li>
                <Link href={`/${locale}/licenses`} className="hover:text-white">
                  {dict.footer.links.licenses}
                </Link>
              </li>
              <li>
                <span className="cursor-default">{dict.footer.links.privacy}</span>
              </li>
              <li>
                <span className="cursor-default">{dict.footer.links.terms}</span>
              </li>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-6xl px-4 text-center text-xs text-zinc-600">
          {dict.footer.rights.replace("{year}", String(year))}
        </p>
      </footer>
    </div>
  );
}

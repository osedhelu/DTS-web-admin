import { notFound } from "next/navigation";

import { MarketingLanding } from "@/features/marketing/components/MarketingLanding";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

interface HomePageProps {
  params: Promise<{ lang: string }>;
}

export default async function LocalizedHomePage({ params }: HomePageProps) {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang as Locale);

  return <MarketingLanding dict={dict} locale={lang as Locale} />;
}

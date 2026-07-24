import { notFound } from "next/navigation";

import {
  LegalPageShell,
  LegalSections,
} from "@/features/marketing/components/LegalPageShell";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { locales, type Locale } from "@/lib/i18n/config";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function AppReviewPage({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);

  return (
    <LegalPageShell
      locale={lang as Locale}
      brand={dict.nav.brand}
      title={dict.appReview.title}
      intro={dict.appReview.intro}
      backLabel={dict.legalCommon.back}
    >
      <LegalSections sections={dict.appReview.sections} />
    </LegalPageShell>
  );
}

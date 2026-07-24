import { notFound } from "next/navigation";

import { DeleteAccountRequestForm } from "@/features/marketing/components/DeleteAccountRequestForm";
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

export default async function DeleteAccountPage({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);
  const supportEmail = dict.legalCommon.supportEmail;

  return (
    <LegalPageShell
      locale={lang as Locale}
      brand={dict.nav.brand}
      title={dict.deleteAccount.title}
      intro={dict.deleteAccount.intro}
      backLabel={dict.legalCommon.back}
    >
      <LegalSections sections={dict.deleteAccount.sections} />
      <DeleteAccountRequestForm
        copy={dict.deleteAccount.form}
        supportEmail={supportEmail}
      />
      <p className="mt-10 text-xs text-zinc-600">{dict.legalCommon.lastUpdated}</p>
    </LegalPageShell>
  );
}

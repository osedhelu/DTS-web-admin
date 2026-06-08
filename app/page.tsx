import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { defaultLocale } from "@/lib/i18n/config";
import { getLocaleFromAcceptLanguage } from "@/lib/i18n/get-locale";

export default async function RootPage() {
  const headerList = await headers();
  const locale = getLocaleFromAcceptLanguage(headerList.get("accept-language"));
  redirect(`/${locale ?? defaultLocale}`);
}

import { getTranslations } from "next-intl/server";

import {
  LegalContactSection,
  LegalList,
  LegalPageLayout,
  LegalSection,
  LegalSections,
} from "@/features/legal/components/legal-page-layout";
import { legalData } from "@/features/legal/legal-data";

import type { Metadata } from "next";

/**
 * Cookies and browser storage the app sets. Every entry must be strictly
 * necessary; mount the ConsentManager before adding anything that is not.
 */
const storageKeys = [
  // @if auth
  "session",
  "hcaptcha",
  // @endif
  // @if cloudflare
  "cloudflare",
  // @endif
  // @if not (auth or cloudflare)
  "none",
  // @endif
] as const;

const closingKeys = ["analytics", "control", "changes"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.cookiePage");

  return {
    robots: { index: false, follow: false },
    title: t("title"),
  };
}

export default async function CookiePolicyPage() {
  const t = await getTranslations("legal");

  return (
    <LegalPageLayout
      lastUpdated={t("common.lastUpdated", { date: legalData.cookieLastUpdated })}
      title={t("cookiePage.title")}
    >
      <LegalSections keys={["intro"]} page="cookiePage" />

      <LegalSection title={t("cookiePage.sections.used.title")}>
        <p>{t("cookiePage.sections.used.lead")}</p>
        <LegalList items={storageKeys.map((key) => t(`cookiePage.storage.${key}`))} />
      </LegalSection>

      <LegalSections keys={closingKeys} page="cookiePage" />
      <LegalContactSection />
    </LegalPageLayout>
  );
}

import { getTranslations } from "next-intl/server";

import {
  LegalContactSection,
  LegalPageLayout,
  LegalSections,
} from "@/features/legal/components/legal-page-layout";
import { legalData } from "@/features/legal/legal-data";

import type { Metadata } from "next";

/** Section order. The copy lives in messages/en/legal.json under termsPage.sections. */
const sectionKeys = [
  "agreement",
  "service",
  // @if auth
  "accounts",
  // @endif
  "acceptableUse",
  "intellectualProperty",
  "thirdParty",
  "termination",
  "disclaimer",
  "liability",
  "changes",
  "governingLaw",
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.termsPage");

  return {
    robots: { index: false, follow: false },
    title: t("title"),
  };
}

export default async function TermsPage() {
  const t = await getTranslations("legal");

  return (
    <LegalPageLayout
      lastUpdated={t("common.lastUpdated", { date: legalData.termsLastUpdated })}
      title={t("termsPage.title")}
    >
      <LegalSections keys={sectionKeys} page="termsPage" />
      <LegalContactSection />
    </LegalPageLayout>
  );
}

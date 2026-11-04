import { getTranslations } from "next-intl/server";

import {
  LegalContactSection,
  LegalExternalLink,
  LegalList,
  LegalPageLayout,
  LegalSection,
  LegalSections,
} from "@/features/legal/components/legal-page-layout";
import { legalData } from "@/features/legal/legal-data";

import type { Metadata } from "next";

/** Section order. The copy lives in messages/en/legal.json under privacyPage. */
const openingKeys = [
  "intro",
  "information",
  // @if auth
  "accountData",
  // @endif
  "use",
  "legalBasis",
] as const;

/** Providers that process personal data. Keep in sync with the services you use. */
const processorKeys = [
  // @if cloudflare
  "cloudflare",
  // @else
  "hosting",
  // @endif
  // @if supabase
  "supabase",
  // @endif
  // @if auth
  "google",
  "hcaptcha",
  // @endif
] as const;

const middleKeys = ["transfers", "retention", "security"] as const;

const closingKeys = ["cookies", "children", "changes"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.privacyPage");

  return {
    robots: { index: false, follow: false },
    title: t("title"),
  };
}

export default async function PrivacyPolicyPage() {
  const t = await getTranslations("legal");
  const { supervisoryAuthority } = legalData;

  return (
    <LegalPageLayout
      lastUpdated={t("common.lastUpdated", { date: legalData.privacyLastUpdated })}
      title={t("privacyPage.title")}
    >
      <LegalSections keys={openingKeys} page="privacyPage" />

      <LegalSection title={t("privacyPage.sections.processors.title")}>
        <p>{t("privacyPage.sections.processors.lead")}</p>
        <LegalList items={processorKeys.map((key) => t(`privacyPage.processors.${key}`))} />
      </LegalSection>

      <LegalSections keys={middleKeys} page="privacyPage" />

      <LegalSection title={t("privacyPage.sections.rights.title")}>
        <p>{t("privacyPage.sections.rights.lead")}</p>
        {supervisoryAuthority.url ? (
          <p>
            {t("privacyPage.sections.rights.authority")}
            {" "}
            <LegalExternalLink href={supervisoryAuthority.url}>
              {supervisoryAuthority.name || supervisoryAuthority.url}
            </LegalExternalLink>
            .
          </p>
        ) : null}
      </LegalSection>

      <LegalSections keys={closingKeys} page="privacyPage" />
      <LegalContactSection />
    </LegalPageLayout>
  );
}

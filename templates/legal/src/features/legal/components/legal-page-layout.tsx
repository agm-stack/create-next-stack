import { getMessages, getTranslations } from "next-intl/server";
import { Fragment } from "react";

import { Footer } from "@/components/layout/footer";
import { Logo } from "@/components/ui/logo";
import { legalData } from "@/features/legal/legal-data";
import { routes } from "@/utils/routes";

import type { ReactNode } from "react";

type LegalPageLayoutProps = {
  children: ReactNode,
  lastUpdated: string,
  // Pages that place <LegalOperatorDetails /> themselves pass false.
  showOperatorDetails?: boolean,
  title: string
};

type LegalSectionProps = {
  children: ReactNode,
  title: string
};

type LegalListProps = {
  items: readonly string[],
  ordered?: boolean
};

type LegalParagraphsProps = {
  paragraphs: readonly string[]
};

/** One section of a policy page in `messages/en/legal.json`. */
type LegalSectionContent = {
  title: string,
  paragraphs?: string[],
  lead?: string,
  items?: string[],
  after?: string[]
};

type LegalPageKey = "termsPage" | "privacyPage" | "cookiePage";

export function LegalParagraphs({ paragraphs }: LegalParagraphsProps) {
  return (
    <>
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </>
  );
}

export function LegalList({ items, ordered = false }: LegalListProps) {
  const List = ordered ? "ol" : "ul";

  return (
    <List
      className={
        ordered
          ? "list-decimal space-y-2 pl-6"
          : "list-disc space-y-2 pl-6"
      }
    >
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </List>
  );
}

export function LegalSection({ children, title }: LegalSectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-4 text-sm leading-7 text-foreground/90">
        {children}
      </div>
    </section>
  );
}

const legalLinkClassName = "text-brand underline underline-offset-4 hover:text-brand/80";

export function LegalExternalLink({ children, href }: { children: ReactNode, href: string }) {
  return (
    <a className={legalLinkClassName} href={href} rel="noopener noreferrer" target="_blank">
      {children}
    </a>
  );
}

export function LegalEmailLink() {
  return (
    <a className={legalLinkClassName} href={`mailto:${legalData.email}`}>
      {legalData.email}
    </a>
  );
}

/**
 * Renders `legal.<page>.sections.<key>` for each key, in order. Pages keep the
 * order (and module-specific sections) in code; the copy stays in messages.
 */
export async function LegalSections({ keys, page }: { keys: readonly string[], page: LegalPageKey }) {
  const messages = await getMessages();
  const sections: Record<string, LegalSectionContent | undefined> = messages.legal[page].sections;

  return keys.map((key) => {
    const section = sections[key];

    if (!section) {
      return null;
    }

    return (
      <LegalSection key={key} title={section.title}>
        {section.paragraphs && <LegalParagraphs paragraphs={section.paragraphs} />}
        {section.lead && <p>{section.lead}</p>}
        {section.items && <LegalList items={section.items} />}
        {section.after && <LegalParagraphs paragraphs={section.after} />}
      </LegalSection>
    );
  });
}

/** Closing section shared by every policy page. */
export async function LegalContactSection() {
  const t = await getTranslations("legal.common");

  return (
    <LegalSection title={t("contactTitle")}>
      <p>
        {t("contactLead")}
        {" "}
        <LegalEmailLink />
        .
      </p>
    </LegalSection>
  );
}

/** Operator identification required by EU e-commerce rules; empty values are hidden. */
export async function LegalOperatorDetails() {
  const t = await getTranslations("legal.operator");
  const rows = [
    { label: t("company"), value: legalData.companyName },
    { label: t("country"), value: legalData.country },
    { label: t("address"), value: legalData.registeredAddress },
    { label: t("registrationNumber"), value: legalData.registrationNumber },
    { label: t("vatId"), value: legalData.vatId },
  ].filter((row) => row.value);

  return (
    <section className="rounded-md border border-border/80 bg-muted/30 p-4 text-sm">
      <h2 className="font-semibold">{t("title")}</h2>
      <dl className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-[auto_1fr]">
        {rows.map((row) => (
          <Fragment key={row.label}>
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd>{row.value}</dd>
          </Fragment>
        ))}
        <dt className="text-muted-foreground">{t("email")}</dt>
        <dd>
          <LegalEmailLink />
        </dd>
      </dl>
    </section>
  );
}

export function LegalPageLayout({
  children,
  lastUpdated,
  showOperatorDetails = true,
  title,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-12">
          <Logo href={routes.home} />
        </div>

        <header className="mb-10 border-b border-border/80 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{lastUpdated}</p>
        </header>

        {showOperatorDetails ? (
          <div className="mb-10">
            <LegalOperatorDetails />
          </div>
        ) : null}

        <article className="space-y-10">{children}</article>
      </main>

      <Footer />
    </div>
  );
}

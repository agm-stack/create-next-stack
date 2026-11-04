// @if legal
import { Link } from "@/components/ui/link";
// @endif
import { Logo } from "@/components/ui/logo";
import { getText } from "@/i18n/get-text";
import { routes } from "@/utils/routes";

import type { ReactNode } from "react";

// @if legal
const linkClassName = "text-sm text-muted-foreground transition-colors hover:text-brand";

function FooterColumn({ children, label }: { children: ReactNode, label: string }) {
  return (
    <nav aria-label={label}>
      <h2 className="text-xs font-semibold tracking-[0.16em] text-foreground uppercase">
        {label}
      </h2>
      <ul className="mt-4 grid gap-3">{children}</ul>
    </nav>
  );
}

// @endif
export async function Footer({ children }: { children?: ReactNode }) {
  const t = await getText("common.footer");
  // @if legal
  const legalT = await getText("legal.footer");
  // @endif

  return (
    <footer className="mt-16 border-t border-border/80 bg-card">
      <div className="mx-auto w-full max-w-6xl px-5 pt-14 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr] lg:gap-10">
          <div>
            <Logo href={routes.home} size="sm" />
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
              {t("description")}
            </p>
          </div>
          {children}
          {/* @if legal */}
          <FooterColumn label={legalT("label")}>
            <li>
              <Link className={linkClassName} href={routes.privacy}>
                {legalT("privacy")}
              </Link>
            </li>
            <li>
              <Link className={linkClassName} href={routes.terms}>
                {legalT("terms")}
              </Link>
            </li>
            <li>
              <Link className={linkClassName} href={routes.cookie}>
                {legalT("cookie")}
              </Link>
            </li>
          </FooterColumn>
          {/* @endif */}
        </div>

        <div className="mt-12 border-t border-border/70 pt-6 text-center sm:text-left">
          <p className="text-xs text-muted-foreground">
            {t("copyright", { year: String(new Date().getFullYear()) })}
          </p>
        </div>
      </div>
    </footer>
  );
}

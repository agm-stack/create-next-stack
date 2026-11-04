import Link from "next/link";

import { brand } from "@/utils/brand";
import { cn } from "@/utils/styles";

import type { Route } from "next";

type LogoVariant = "icon" | "logo";
type LogoSize = "xs" | "sm" | "md" | "lg";

export type LogoProps = {
  /** `icon` renders the mark only, `logo` adds the app name. */
  variant?: LogoVariant,
  size?: LogoSize,
  href?: Route,
  className?: string
};

const SIZE_CLASSES: Record<LogoSize, { mark: string, name: string }> = {
  xs: { mark: "size-6", name: "text-base" },
  sm: { mark: "size-7", name: "text-lg" },
  md: { mark: "size-9", name: "text-2xl" },
  lg: { mark: "size-12", name: "text-4xl" },
};

/**
 * Placeholder brand mark. It matches `src/app/icon.svg`; replace both with
 * your own artwork.
 */
function LogoMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={cn("shrink-0 text-brand", className)} viewBox="0 0 32 32">
      <rect fill="currentColor" height="32" rx="8" width="32" />
      <path d="M16 7l9 9-9 9-9-9z" fill="var(--brand-foreground, #fff)" />
    </svg>
  );
}

function Logo({ className, href, size = "md", variant = "logo" }: LogoProps) {
  const sizes = SIZE_CLASSES[size];

  const content = (
    <>
      <LogoMark className={sizes.mark} />
      {variant === "logo" && (
        <span className={cn("font-semibold tracking-tight text-foreground", sizes.name)}>{brand.name}</span>
      )}
    </>
  );

  const classes = cn("inline-flex items-center gap-2", className);

  if (href) {
    return (
      <Link aria-label={brand.name} className={classes} href={href}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}

export { Logo };

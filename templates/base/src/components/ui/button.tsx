"use client";

import { Button as BaseButton } from "@base-ui/react/button";

import { type VariantProps, cva } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import NextLink from "next/link";

import * as React from "react";

import { cn } from "@/utils/styles";

import type { ButtonProps as BaseButtonProps } from "@base-ui/react/button";
import type { LinkProps } from "next/link";

const buttonVariants = cva(
  `
    relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium
    whitespace-nowrap transition-colors outline-none hover:cursor-pointer
    focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background 
    disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
    aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50
    data-disabled:pointer-events-none data-disabled:opacity-50
    [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4
  `,
  {
    variants: {
      color: {
        accent: "",
        brand: "",
        destructive: "",
        primary: "",
        secondary: "",
        success: "",
        warning: "",
      },
      size: {
        icon: "size-9",
        lg: "h-10 px-5",
        md: "h-9 px-4",
        sm: "h-8 px-3 text-xs",
      },
      variant: {
        filled: "",
        flat: "",
        ghost: "",
        outline: "border",
      },
    },
    defaultVariants: {
      color: "primary",
      size: "md",
      variant: "filled",
    },
  },
);

type ButtonColor = NonNullable<VariantProps<typeof buttonVariants>["color"]>;
type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;

const buttonColorVariants = {
  accent: {
    filled:
      "bg-accent text-accent-foreground hover:bg-accent/80",
    flat:
      "bg-accent/60 text-accent-foreground hover:bg-accent",
    ghost: "text-accent-foreground hover:bg-accent",
    outline:
      "border-accent-foreground/20 text-accent-foreground hover:bg-accent",
  },
  brand: {
    filled: "bg-brand text-brand-foreground hover:bg-brand/90",
    flat: "bg-brand/10 text-brand hover:bg-brand/20",
    ghost: "text-brand hover:bg-brand/10",
    outline: "border-brand text-brand hover:bg-brand/10",
  },
  destructive: {
    filled:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    flat: "bg-destructive/10 text-destructive hover:bg-destructive/20",
    ghost: "text-destructive hover:bg-destructive/10",
    outline:
      "border-destructive text-destructive hover:bg-destructive/10",
  },
  primary: {
    filled: "bg-primary text-primary-foreground hover:bg-primary/90",
    flat: "bg-primary/10 text-primary hover:bg-primary/20",
    ghost: "text-primary hover:bg-primary/10",
    outline: "border-primary text-primary hover:bg-primary/10",
  },
  secondary: {
    filled:
      "bg-secondary text-secondary-foreground hover:bg-secondary-foreground/20",
    flat:
      "bg-secondary text-secondary-foreground hover:bg-secondary-foreground/20",
    ghost: "text-secondary-foreground hover:bg-secondary-foreground/20",
    outline:
      "border-secondary text-secondary-foreground hover:bg-secondary-foreground/20",
  },
  success: {
    filled: "bg-success text-success-foreground hover:bg-success/90",
    flat: "bg-success/10 text-success hover:bg-success/20",
    ghost: "text-success hover:bg-success/10",
    outline: "border-success text-success hover:bg-success/10",
  },
  warning: {
    filled: "bg-warning text-warning-foreground hover:bg-warning/90",
    flat: "bg-warning/15 text-warning-foreground hover:bg-warning/25",
    ghost: "text-warning-foreground hover:bg-warning/20",
    outline:
      "border-warning text-warning-foreground hover:bg-warning/20",
  },
} satisfies Record<ButtonColor, Record<ButtonVariant, string>>;

type ButtonPrimitiveProps = Omit<
  BaseButtonProps,
  "children" | "className" | "disabled" | "nativeButton" | "ref" | "render"
>;

type ButtonLinkProps = Pick<
  LinkProps,
  | "as"
  | "onNavigate"
  | "prefetch"
  | "replace"
  | "scroll"
  | "shallow"
  | "transitionTypes"
> & {
  href?: LinkProps["href"],
  rel?: React.AnchorHTMLAttributes<HTMLAnchorElement>["rel"],
  target?: React.AnchorHTMLAttributes<HTMLAnchorElement>["target"]
};

export type ButtonProps = ButtonPrimitiveProps &
  VariantProps<typeof buttonVariants> &
  ButtonLinkProps & {
    children?: React.ReactNode,
    className?: string,
    disabled?: boolean,
    endContent?: React.ReactNode,
    fullWidth?: boolean,
    iconOnly?: boolean,
    loading?: boolean,
    ref?: React.Ref<HTMLElement>,
    startContent?: React.ReactNode
  };

export { buttonVariants };

export function Button({
  as,
  children,
  className,
  color,
  disabled = false,
  endContent,
  fullWidth = false,
  href,
  iconOnly = false,
  loading = false,
  onNavigate,
  prefetch,
  ref,
  rel,
  replace,
  scroll,
  shallow,
  size,
  startContent,
  target,
  transitionTypes,
  type,
  variant,
  ...buttonProps
}: ButtonProps) {
  const resolvedColor = color ?? "primary";
  const resolvedSize = iconOnly ? "icon" : (size ?? "md");
  const resolvedVariant = variant ?? "filled";
  const isDisabled = disabled || loading;
  const hasHref = href !== undefined;

  return (
    <BaseButton
      {...buttonProps}
      ref={ref}
      aria-busy={loading || undefined}
      className={cn(
        buttonVariants({
          color: resolvedColor,
          size: resolvedSize,
          variant: resolvedVariant,
        }),
        buttonColorVariants[resolvedColor][resolvedVariant],
        fullWidth && "w-full",
        className,
      )}
      data-slot="button"
      disabled={isDisabled}
      nativeButton={!hasHref}
      render={
        hasHref ? (
          <NextLink
            as={as}
            href={href}
            prefetch={prefetch}
            rel={rel}
            replace={replace}
            scroll={scroll}
            shallow={shallow}
            target={target}
            transitionTypes={transitionTypes}
            onNavigate={onNavigate}
          />
        ) : undefined
      }
      type={hasHref ? undefined : type}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center gap-2",
          loading && "opacity-0",
        )}
      >
        {startContent}
        {children}
        {endContent}
      </span>
      {loading && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <LoaderCircle className="animate-spin" />
        </span>
      )}
    </BaseButton>
  );
}

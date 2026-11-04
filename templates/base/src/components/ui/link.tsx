import NextLink, { type LinkProps } from "next/link";

import type { AnchorHTMLAttributes, PropsWithChildren } from "react";

type AppLinkProps<RouteType extends string = string> = PropsWithChildren<
  LinkProps<RouteType> &
    Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "rel" | "target">
>;

export function Link<RouteType extends string = string>({
  children,
  prefetch = false,
  ...rest
}: AppLinkProps<RouteType>) {
  return (
    <NextLink prefetch={prefetch} {...rest}>
      {children}
    </NextLink>
  );
}

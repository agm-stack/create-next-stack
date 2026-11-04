// @if auth
import type { Route } from "next";

// @endif
export const routes = {
  home: "/",
  // @if auth
  signIn: "/sign-in",
  signUp: "/sign-up",
  dashboard: "/dashboard" as Route,
  // @endif
  // @if legal
  privacy: "/legal/privacy-policy",
  terms: "/legal/terms",
  cookie: "/legal/cookie-policy",
  // @endif
  devThemePlayground: "/dev/theme-playground",
} as const;

/** Path prefixes used for route-group checks (proxy access rules). */
export const routePrefixes = {
  // @if auth
  authApi: "/api/auth/",
  // @endif
  // @if legal
  legal: "/legal",
  // @endif
  /** Development-only pages and routes; 404 everywhere else. */
  dev: "/dev/",
  devApi: "/api/dev/",
} as const;

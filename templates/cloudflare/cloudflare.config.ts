import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "__APP_SLUG__",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "__CF_COMPAT_DATE__",
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      // Burst limits per user/IP. Keep in sync with RATE_LIMIT_PROFILES in
      // src/lib/api/rate-limit.ts. The Workers binding only supports 10s and
      // 60s periods; put hourly ceilings in WAF rules or database quotas.
      // Namespaces are unique integers per Cloudflare account.
      // @if auth
      RATE_LIMIT_AUTH: bindings.rateLimit({
        namespace: "1001",
        simple: { limit: 10, period: 60 },
      }),
      // @endif
      RATE_LIMIT_STANDARD: bindings.rateLimit({
        namespace: "1002",
        simple: { limit: 120, period: 60 },
      }),
      RATE_LIMIT_WRITE: bindings.rateLimit({
        namespace: "1003",
        simple: { limit: 20, period: 60 },
      }),
    },
  }),
});

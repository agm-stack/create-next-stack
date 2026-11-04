// @if i18n
import createNextIntlPlugin from "next-intl/plugin";

// @endif
import type { NextConfig } from "next";

// @if i18n
const withNextIntl = createNextIntlPlugin({
  requestConfig: "./src/i18n/request.ts",
  experimental: {
    // Generates typed declarations for each messages file. Register new
    // namespaces here and in src/i18n/messages.ts.
    createMessagesDeclaration: [
      // @if auth
      "./messages/en/auth.json",
      // @endif
      "./messages/en/common.json",
      // @if legal
      "./messages/en/legal.json",
      // @endif
      "./messages/en/theme-playground.json",
    ],
  },
});

// @endif
const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
};

// @if i18n
export default withNextIntl(nextConfig);
// @else
export default nextConfig;
// @endif

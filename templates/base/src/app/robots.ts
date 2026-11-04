import { appConfig } from "@/config";

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: "/",
      disallow: [
        "/api/",
        "/dev/",
        // @if auth
        "/sign-in",
        "/sign-up",
        "/dashboard",
        // @endif
      ],
      userAgent: "*",
    },
    sitemap: `${appConfig.site.url}/sitemap.xml`,
  };
}

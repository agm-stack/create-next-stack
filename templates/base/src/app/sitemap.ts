import { appConfig } from "@/config";

import type { MetadataRoute } from "next";

// Only indexable, canonical public pages belong here. Legal and auth pages are
// noindex.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      changeFrequency: "monthly",
      priority: 1,
      url: `${appConfig.site.url}/`,
    },
  ];
}

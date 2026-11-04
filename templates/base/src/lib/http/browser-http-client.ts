import { createHttpClient } from "./http";

import type { CreateHttpClientConfig } from "./types";

const defaultConfig: CreateHttpClientConfig = {
  rateLimit: {
    "/auth/refresh": {
      maxRequests: 3,
      rateLimitDuration: 1000 * 10,
    },
  },
};

export const browserHttpClient = createHttpClient({ ...defaultConfig, name: "Browser HTTP Client" });

import axios from "axios";

import { appConfig } from "@/config";
import { Logger } from "@/lib/logger";
import { sleep } from "@/utils/common";

import { HTTP_STATUS_CODES } from "./http-status-codes";

import type {
  CreateHttpClientConfig,
  HttpClient,
  HttpClientConfig,
  HttpClientError,
  HttpClientInstance,
  HttpClientInterceptorConfig,
  HttpClientLoopGuardConfig,
  HttpClientRateLimitRequestTimestamps,
  HttpClientResponse,
  HttpInterceptorId,
  HttpRequestInterceptor,
  HttpResponseErrorInterceptor,
  HttpResponseInterceptor
} from "./types";
import type { LogPayload } from "@/lib/logger";

const defaultLoopGuard: HttpClientLoopGuardConfig = {
  cooldownMs: 30_000,
  maxConsecutiveFailures: 5,
  maxRequests: 20,
  windowMs: 10_000
};

const MAX_LOOP_GUARD_KEYS = 200;

const RETRYABLE_STATUS_CODES = new Set<number>([
  HTTP_STATUS_CODES.TOO_MANY_REQUESTS,
  HTTP_STATUS_CODES.BAD_GATEWAY,
  HTTP_STATUS_CODES.SERVICE_UNAVAILABLE,
  HTTP_STATUS_CODES.GATEWAY_TIMEOUT,
]);

/** Only transient failures are retried: network errors, 429 and gateway/unavailable errors. */
function isRetryableError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  // Cancelled requests are intentional and must not be repeated.
  if (axios.isCancel(error)) {
    return false;
  }

  return !error.response || RETRYABLE_STATUS_CODES.has(error.response.status);
}

const defaultOptions: CreateHttpClientConfig = {
  timeout: appConfig.httpClient.requestTimeout,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  },
  retries: 0,
  retryDelay: 500
};

/**
 * Creates a new HTTP client instance with customizable configuration, including support for rate limiting,
 * request/response interceptors, CSRF token management, and automatic retries with exponential backoff.
 *
 * @param argOptions - Optional configuration object to customize the HTTP client instance.
 * @returns An object exposing HTTP methods (`get`, `post`, `put`, `patch`, `delete`), interceptor management methods,
 *   CSRF token management, and access to the underlying Axios instance.
 *
 * @example
 * ```typescript
 * const client = createHttpClient({ retries: 3, rateLimit: { "/api/resource": { maxRequests: 5, rateLimitDuration: 1000 } } });
 * const response = await client.get("/api/resource");
 * ```
 */
export function createHttpClient(argOptions: CreateHttpClientConfig = {}): HttpClient {
  const axiosConfig: CreateHttpClientConfig = {
    ...defaultOptions,
    ...argOptions,
    headers: {
      ...defaultOptions.headers,
      ...(argOptions?.headers ? argOptions.headers : {})
    }
  };

  const {
    debug, loopGuard, name = "HTTP Client", rateLimit, retries = 0, retryDelay = 500
  } = axiosConfig;
  const instance: HttpClientInstance = axios.create(axiosConfig);

  let requestInterceptors: HttpInterceptorId[] = [];
  let responseInterceptors: HttpInterceptorId[] = [];
  let csrfToken: string | undefined;
  const rateLimitRequestTimestamps: HttpClientRateLimitRequestTimestamps = {};

  // --- Logging helper ---
  const log = (message: string, payload: LogPayload = {}) => {
    if (debug) {
      Logger.debug(message, payload);
    }
  };

  /**
   * Add a request interceptor. Returns the interceptor ID.
   */
  const addRequestInterceptor = <E = HttpClientError>(interceptor: HttpRequestInterceptor, errorInterceptor?: HttpResponseErrorInterceptor<E>) => {
    log("Adding Request Interceptor");
    const id = instance.interceptors.request.use((config: HttpClientInterceptorConfig) => {
      log(`Request interceptor. Request sent: ${config.method?.toUpperCase()} ${config.url}`);
      const modifiedConfig = interceptor(config);
      return { ...config, ...modifiedConfig } as HttpClientInterceptorConfig;
    }, errorInterceptor);
    requestInterceptors.push(id);
    return id;
  };

  /**
   * Add a response interceptor. Returns the interceptor ID.
   */
  const addResponseInterceptor = <R = unknown, E = HttpClientError>(
    interceptor: HttpResponseInterceptor<R>,
    errorInterceptor?: HttpResponseErrorInterceptor<E>
  ) => {
    log("Adding Response Interceptor");
    const id = instance.interceptors.response.use(
      (response: HttpClientResponse<R>) => {
        const { config } = response || {};
        log(`Response interceptor. Request received (success): ${config?.method?.toUpperCase()} ${config?.url}`);
        return interceptor(response);
      },
      errorInterceptor
        ? (error) => {
          const { config, status } = error?.response || {};
          log(`Response interceptor. Request received (error ${status || ""}): ${config?.method?.toUpperCase()} ${config?.url}`);
          return errorInterceptor(error);
        }
        : (error) => {
          log(`Response interceptor (error): ${error.message}`);
          return Promise.reject(error);
        }
    );
    responseInterceptors.push(id);
    return id;
  };

  /**
   * Remove a request interceptor by ID.
   */
  const removeRequestInterceptor = (id: HttpInterceptorId) => {
    instance.interceptors.request.eject(id);
    requestInterceptors = requestInterceptors.filter(i => i !== id);
    log(`Removed request Interceptor: ${id}`);
  };

  /**
   * Remove a response interceptor by ID.
   */
  const removeResponseInterceptor = (id: HttpInterceptorId) => {
    instance.interceptors.response.eject(id);
    responseInterceptors = responseInterceptors.filter(i => i !== id);
    log(`Removed response Interceptor: ${id}`);
  };

  /**
   * Remove all request and response interceptors.
   */
  const removeInterceptors = () => {
    requestInterceptors.forEach(id => instance.interceptors.request.eject(id));
    responseInterceptors.forEach(id => instance.interceptors.response.eject(id));
    requestInterceptors = [];
    responseInterceptors = [];
    log("Removed all interceptors");
  };

  /**
   * Get current interceptor IDs.
   */
  const getInterceptors = () => ({
    request: [...requestInterceptors],
    response: [...responseInterceptors],
  });

  /**
   * Check if a URL is currently rate limited.
   */
  const isUrlRateLimited = (url: string): boolean => {
    if (!rateLimit?.[url]) {
      return false;
    }

    const now = Date.now();
    const { maxRequests, rateLimitDuration } = rateLimit[url];

    rateLimitRequestTimestamps[url] = rateLimitRequestTimestamps[url] || [];
    rateLimitRequestTimestamps[url] = rateLimitRequestTimestamps[url].filter(
      timestamp => now - timestamp <= rateLimitDuration
    );

    return rateLimitRequestTimestamps[url].length >= maxRequests;
  };

  /**
   * Add a rate limit request interceptor (per URL).
   */
  const addRateLimitInterceptor = () => {
    log("Adding rate limit interceptor");
    addRequestInterceptor((config: HttpClientConfig) => {
      const url = config.url || "";
      if (isUrlRateLimited(url)) {
        log(`Rate limit exceeded for ${url}`);
        throw new HttpClientRateLimitError(`Rate limit exceeded for ${url}`);
      }
      rateLimitRequestTimestamps[url] = rateLimitRequestTimestamps[url] || [];
      rateLimitRequestTimestamps[url].push(Date.now());
      return config;
    }, (error) => {
      log(`Rate limit request error: ${error.message}`);
      throw error;
    });
  };

  /**
   * Set the CSRF token
   */
  const setCsrfToken = (token: string | undefined) => {
    csrfToken = token;
  };

  const getCsrfToken = (): string | undefined => csrfToken;

  const setBaseUrl = (url: string) => {
    instance.defaults.baseURL = url;
  };

  // --- Loop guard: per "METHOD path" circuit breaker, browser only ---
  const loopGuardConfig: HttpClientLoopGuardConfig | null
    = typeof window === "undefined" || loopGuard === false
      ? null
      : { ...defaultLoopGuard, ...loopGuard };
  const loopGuardState = new Map<string, { blockedUntil: number, failures: number, timestamps: number[] }>();

  const getLoopGuardKey = (config: HttpClientConfig) =>
    `${(config.method || "GET").toUpperCase()} ${(config.url || "").split("?")[0]}`;

  const tripLoopGuard = (key: string, reason: string) => {
    const state = loopGuardState.get(key);
    if (!state) {
      return;
    }

    state.blockedUntil = Date.now() + (loopGuardConfig?.cooldownMs ?? 0);
    state.failures = 0;
    state.timestamps = [];
    Logger.error(`Loop guard tripped for ${key}: ${reason}`);
  };

  const assertLoopGuardOpen = (config: HttpClientConfig) => {
    if (!loopGuardConfig) {
      return;
    }

    const key = getLoopGuardKey(config);
    const now = Date.now();

    // Keep the state map bounded: drop idle endpoints once it grows large.
    if (loopGuardState.size > MAX_LOOP_GUARD_KEYS) {
      for (const [stateKey, entry] of loopGuardState) {
        const isIdle = entry.blockedUntil <= now
          && entry.timestamps.every(timestamp => now - timestamp > loopGuardConfig.windowMs);
        if (isIdle && stateKey !== key) {
          loopGuardState.delete(stateKey);
        }
      }
    }

    let state = loopGuardState.get(key);
    if (!state) {
      state = { blockedUntil: 0, failures: 0, timestamps: [] };
      loopGuardState.set(key, state);
    }

    if (state.blockedUntil > now) {
      throw new HttpClientLoopGuardError(key);
    }

    state.timestamps = state.timestamps.filter(timestamp => now - timestamp <= loopGuardConfig.windowMs);

    if (state.timestamps.length >= loopGuardConfig.maxRequests) {
      tripLoopGuard(key, "too many requests in a short window");
      throw new HttpClientLoopGuardError(key);
    }

    state.timestamps.push(now);
  };

  const recordLoopGuardResult = (config: HttpClientConfig, ok: boolean) => {
    if (!loopGuardConfig) {
      return;
    }

    const key = getLoopGuardKey(config);
    const state = loopGuardState.get(key);

    if (!state) {
      return;
    }

    if (ok) {
      state.failures = 0;
      return;
    }

    state.failures += 1;

    if (state.failures >= loopGuardConfig.maxConsecutiveFailures) {
      tripLoopGuard(key, "too many consecutive failures");
    }
  };

  const requestWithRetries = async <R = unknown>(config: HttpClientConfig, retryCount = 0, delay = 500): Promise<HttpClientResponse<R>> => {
    assertLoopGuardOpen(config);

    try {
      const response = await requestAttempt<R>(config, retryCount, delay);
      recordLoopGuardResult(config, true);
      return response;
    } catch (error) {
      recordLoopGuardResult(config, false);
      throw error;
    }
  };

  const requestAttempt = async <R = unknown>(config: HttpClientConfig, retryCount = 0, delay = 500): Promise<HttpClientResponse<R>> => {
    try {
      return await instance({
        ...config,
        headers: { ...instance.defaults.headers.common, ...config.headers },
      });
    } catch (error) {
      if (retryCount && isRetryableError(error)) {
        await sleep(delay);
        return requestAttempt(config, retryCount - 1, delay * 2);
      }

      throw error;
    }
  };

  if (rateLimit) {
    addRateLimitInterceptor();
  }

  return {
    // Core
    getInstance: () => instance,
    getName: () => name,
    setBaseUrl,
    // Requests
    get: <R = unknown>(url: string, config?: HttpClientConfig) => requestWithRetries<R>({ ...config, url, method: "GET" }, retries, retryDelay),
    post: <R = unknown>(url: string, data?: unknown, config?: HttpClientConfig) => requestWithRetries<R>({ ...config, url, data, method: "POST" }, retries, retryDelay),
    put: <R = unknown>(url: string, data?: unknown, config?: HttpClientConfig) => requestWithRetries<R>({ ...config, url, data, method: "PUT" }, retries, retryDelay),
    patch: <R = unknown>(url: string, data?: unknown, config?: HttpClientConfig) => requestWithRetries<R>({ ...config, url, data, method: "PATCH" }, retries, retryDelay),
    delete: <R = unknown>(url: string, config?: HttpClientConfig) => requestWithRetries<R>({ ...config, url, method: "DELETE" }, retries, retryDelay),
    // Interceptors
    addRequestInterceptor,
    addResponseInterceptor,
    removeRequestInterceptor,
    removeResponseInterceptor,
    getInterceptors,
    removeInterceptors,
    // CSRF Token
    setCsrfToken,
    getCsrfToken,
  };
};

/** Thrown without sending a request when the loop guard has blocked an endpoint. */
export class HttpClientLoopGuardError extends Error {
  constructor(endpoint: string) {
    super(`Requests to ${endpoint} are temporarily blocked after repeated failures`);
    this.name = "HttpClientLoopGuardError";
  }
}

export class HttpClientRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HttpClientRateLimitError";
  }
}
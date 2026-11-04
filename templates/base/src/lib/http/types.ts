import type {
  AxiosError, AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse,
  AxiosResponseHeaders,
  InternalAxiosRequestConfig
} from "axios";

export type HttpClientInstance = AxiosInstance;
export type HttpClientConfig = AxiosRequestConfig;
export type CreateHttpClientConfig = HttpClientConfig & {
  debug?: boolean,
  name?: string,
  retries?: number,
  retryDelay?: number,
  rateLimit?: HttpClientRateLimiterConfig,
  /** Client-side safety net against runaway request loops. Pass `false` to disable. */
  loopGuard?: false | Partial<HttpClientLoopGuardConfig>
};
export type HttpClientLoopGuardConfig = {
  /** Block the endpoint for this long once tripped. */
  cooldownMs: number,
  /** Trip after this many consecutive failed calls to the same endpoint. */
  maxConsecutiveFailures: number,
  /** Trip after this many calls to the same endpoint within `windowMs`. */
  maxRequests: number,
  windowMs: number
};
export type HttpClientRateLimiterConfig = Record<string, {
  maxRequests: number,
  rateLimitDuration: number
}>;
export type HttpClientResponse<R = unknown> = AxiosResponse<R>;
export type HttpClientInterceptorConfig = InternalAxiosRequestConfig;
export type HttpClientRateLimitRequestTimestamps = Record<string, number[]>;
export type HttpInterceptorId = number;
export type HttpRequestInterceptor = (config: HttpClientConfig) => HttpClientConfig;
export type HttpResponseInterceptor<T = unknown> = (response: AxiosResponse<T>) => Promise<AxiosResponse<T, unknown>> | AxiosResponse<T, unknown>;
export type HttpResponseErrorInterceptor<E = unknown> = (error: HttpClientError<E>) => unknown;
export type HttpClient = {
  get: <T = unknown>(url: string, config?: HttpClientConfig) => Promise<AxiosResponse<T, unknown>>,
  post: <T = unknown>(url: string, data?: unknown, config?: HttpClientConfig) => Promise<AxiosResponse<T, unknown>>,
  put: <T = unknown>(url: string, data?: unknown, config?: HttpClientConfig) => Promise<AxiosResponse<T, unknown>>,
  patch: <T = unknown>(url: string, data?: unknown, config?: HttpClientConfig) => Promise<AxiosResponse<T, unknown>>,
  delete: <T = unknown>(url: string, config?: HttpClientConfig) => Promise<AxiosResponse<T, unknown>>,
  //
  getInterceptors: () => { request: HttpInterceptorId[], response: HttpInterceptorId[] },
  addRequestInterceptor: (interceptor: HttpRequestInterceptor) => HttpInterceptorId,
  addResponseInterceptor: (interceptor: HttpResponseInterceptor, errorInterceptor?: HttpResponseErrorInterceptor) => HttpInterceptorId,
  removeInterceptors: () => void,
  removeRequestInterceptor: (id: HttpInterceptorId) => void,
  removeResponseInterceptor: (id: HttpInterceptorId) => void,
  //
  getInstance: () => AxiosInstance,
  getName: () => string | undefined,
  setCsrfToken: (token: string | undefined) => void,
  getCsrfToken: () => string | undefined,
  setBaseUrl: (url: string) => void
};
export type HttpClientError<T = unknown> = AxiosError<T>;
export type HttpClientRequestHeaders = AxiosRequestHeaders;
export type HttpClientResponseHeaders = AxiosResponseHeaders;
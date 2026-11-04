import { HTTP_STATUS_CODES } from "@/lib/http";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
    public readonly headers?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static unauthorized(message = "Authentication required") {
    return new ApiError(HTTP_STATUS_CODES.UNAUTHORIZED, message);
  }

  static badRequest(message = "Invalid request", details?: unknown) {
    return new ApiError(HTTP_STATUS_CODES.BAD_REQUEST, message, details);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(HTTP_STATUS_CODES.NOT_FOUND, message);
  }

  static payloadTooLarge(message = "Request body too large") {
    return new ApiError(HTTP_STATUS_CODES.PAYLOAD_TOO_LARGE, message);
  }

  static tooManyRequests(retryAfterSeconds: number, message = "Too many requests") {
    return new ApiError(
      HTTP_STATUS_CODES.TOO_MANY_REQUESTS,
      message,
      { code: "rate-limited" },
      { "Retry-After": String(retryAfterSeconds) },
    );
  }
}

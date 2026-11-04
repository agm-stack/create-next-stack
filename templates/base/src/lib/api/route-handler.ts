import "server-only";

import { NextResponse } from "next/server";

import { HTTP_STATUS_CODES } from "@/lib/http";
import { Logger } from "@/lib/logger";

import { ApiError } from "./errors";
import { enforceRateLimit, getClientIp } from "./rate-limit";
import { getRequestOrigin } from "./request";
import { validate } from "./validate";

import type { RateLimitProfile } from "./rate-limit";
import type { z } from "zod";

type ContextBase = {
  baseUrl: string
};

type HandlerArgs<TData, TContext> = {
  request: Request,
  data: TData,
  context: TContext
};

type SharedOptions<TContext extends object> = {
  createContext?: (request: Request) => Promise<TContext> | TContext,
  /** Maximum JSON body size in bytes. Defaults to 64 KB. */
  maxBodyBytes?: number,
  /**
   * Rate limit profile. Keyed by `context.userId` when the context provides
   * one, otherwise by client IP.
   */
  rateLimit?: RateLimitProfile
};

type ApiRouteHandlerOptionsWithSchema<TSchema extends z.ZodTypeAny, TContext extends object> = SharedOptions<TContext> & {
  schema: TSchema
};

type ApiRouteHandlerOptionsWithoutSchema<TContext extends object> = SharedOptions<TContext> & {
  schema?: undefined
};

const UUID_SEGMENT = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

function getRateLimitKey(request: Request, context: object): string {
  const userId = (context as { userId?: unknown }).userId;

  return typeof userId === "string" ? `user:${userId}` : `ip:${getClientIp(request)}`;
}

function getRouteName(request: Request): string {
  const { pathname } = new URL(request.url);

  return `${request.method} ${pathname.replaceAll(UUID_SEGMENT, ":id")}`;
}

/**
 * Wraps a route handler with context creation, rate limiting, body validation
 * and uniform error responses: `{ error, details? }` with the matching status.
 */
export function routeHandler<TSchema extends z.ZodTypeAny, TExtraCtx extends object = object>(
  options: ApiRouteHandlerOptionsWithSchema<TSchema, TExtraCtx>,
  handler: (args: HandlerArgs<z.infer<TSchema>, ContextBase & TExtraCtx>) => Promise<Response>
): (request: Request) => Promise<Response>;
export function routeHandler<TExtraCtx extends object = object>(
  options: ApiRouteHandlerOptionsWithoutSchema<TExtraCtx>,
  handler: (args: HandlerArgs<undefined, ContextBase & TExtraCtx>) => Promise<Response>
): (request: Request) => Promise<Response>;
export function routeHandler<TSchema extends z.ZodTypeAny, TExtraCtx extends object = object>(
  options: ApiRouteHandlerOptionsWithSchema<TSchema, TExtraCtx> | ApiRouteHandlerOptionsWithoutSchema<TExtraCtx>,
  handler: (args: HandlerArgs<z.infer<TSchema> | undefined, ContextBase & TExtraCtx>) => Promise<Response>
) {
  return async (request: Request): Promise<Response> => {
    try {
      const baseUrl = getRequestOrigin(request);
      const extra = options.createContext ? await options.createContext(request) : ({} as TExtraCtx);
      const context = { baseUrl, ...extra };

      if (options.rateLimit) {
        await enforceRateLimit(
          options.rateLimit,
          getRateLimitKey(request, context),
          getRouteName(request),
        );
      }

      const data = options.schema
        ? await validate(request, options.schema, options.maxBodyBytes)
        : undefined;

      return await handler({ request, data, context });
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json(
          { error: err.message, details: err.details },
          { headers: err.headers, status: err.status },
        );
      }

      Logger.error("Unhandled API route error", { data: { error: err } });

      return NextResponse.json({ error: "Internal Server Error" }, { status: HTTP_STATUS_CODES.SERVER_ERROR });
    }
  };
}

import { isClient } from "@/utils/browser";

export type LogType = "trace" | "debug" | "info" | "warn" | "error";

export type LogOptions = {
  ignoreClientSide?: boolean,
  logId?: string,
  prefix?: string
};

export type LogPayload = {
  data?: Record<string, unknown>,
  scope?: string,
  options?: LogOptions
};

/** Makes Error instances (and circular data) safe to serialize as JSON. */
function serializable(value: unknown): unknown {
  try {
    return JSON.parse(JSON.stringify(value, (_key, item) => (
      item instanceof Error
        ? { name: item.name, message: item.message, stack: item.stack }
        : item
    )));
  } catch {
    return String(value);
  }
}

function print(type: LogType, message: string, payload: LogPayload = {}) {
  const { data, options } = payload;
  const { ignoreClientSide, logId, prefix } = options ?? {};
  // eslint-disable-next-line no-console
  const fn = console[type];

  if (!isClient()) {
    // Structured single-line JSON for server log aggregation.
    fn(JSON.stringify({
      type,
      ...(logId ? { logId } : {}),
      "@message": prefix ? `[${prefix}]: ${message}` : message,
      ...(data ? { data: serializable(data) } : {}),
    }));
  } else if (!ignoreClientSide) {
    fn(message, payload);
  }
}

function createLogMethod(level: LogType) {
  return (message: string, payload?: LogPayload) => print(level, message, payload);
}

export const Logger: Record<LogType, (message: string, payload?: LogPayload) => void> = {
  trace: createLogMethod("trace"),
  debug: createLogMethod("debug"),
  info: createLogMethod("info"),
  warn: createLogMethod("warn"),
  error: createLogMethod("error"),
};

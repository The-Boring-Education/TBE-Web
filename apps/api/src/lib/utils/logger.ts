type LogLevel = "info" | "warn" | "error" | "debug";

interface LogMeta {
  [key: string]: unknown;
}

const LOG_COLORS: Record<LogLevel, string> = {
  info: "\x1b[36m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
  debug: "\x1b[90m",
};

const METHOD_COLORS: Record<string, string> = {
  GET: "\x1b[32m",
  POST: "\x1b[34m",
  PATCH: "\x1b[33m",
  PUT: "\x1b[33m",
  DELETE: "\x1b[31m",
  OPTIONS: "\x1b[90m",
};

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

const isDev = process.env.NODE_ENV !== "production";

const formatTimestamp = (): string => {
  return new Date().toISOString();
};

const safeStringify = (obj: unknown): string => {
  try {
    return JSON.stringify(obj, (_key, value) => {
      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          stack: value.stack,
        };
      }
      return value;
    });
  } catch {
    return String(obj);
  }
};

const log = (level: LogLevel, message: string, meta?: LogMeta): void => {
  const timestamp = formatTimestamp();

  if (!isDev) {
    const structured: Record<string, unknown> = {
      level,
      message,
      timestamp,
    };
    if (meta && Object.keys(meta).length > 0) {
      structured.meta = meta;
    }
    const output = JSON.stringify(structured);
    switch (level) {
      case "error":
        console.error(output);
        break;
      case "warn":
        console.warn(output);
        break;
      default:
        console.log(output);
    }
    return;
  }

  const color = LOG_COLORS[level];
  const tag = level.toUpperCase().padEnd(5);
  const metaStr =
    meta && Object.keys(meta).length > 0 ? " " + safeStringify(meta) : "";

  const output = `${DIM}${timestamp}${RESET} ${color}${BOLD}[${tag}]${RESET} ${message}${metaStr ? `${DIM}${metaStr}${RESET}` : ""}`;

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    case "debug":
      console.debug(output);
      break;
    default:
      console.log(output);
  }
};

const formatMethod = (method: string): string => {
  if (!isDev) return method;
  const color = METHOD_COLORS[method] || "\x1b[37m";
  return `${color}${BOLD}${method.padEnd(7)}${RESET}`;
};

const formatStatusCode = (status: number): string => {
  if (!isDev) return String(status);
  if (status >= 500) return `\x1b[31m${status}${RESET}`;
  if (status >= 400) return `\x1b[33m${status}${RESET}`;
  if (status >= 300) return `\x1b[36m${status}${RESET}`;
  return `\x1b[32m${status}${RESET}`;
};

const formatDuration = (ms: number): string => {
  if (!isDev) return `${ms}ms`;
  if (ms > 1000) return `\x1b[31m${ms}ms${RESET}`;
  if (ms > 300) return `\x1b[33m${ms}ms${RESET}`;
  return `\x1b[32m${ms}ms${RESET}`;
};

export const logger = {
  info: (message: string, meta?: LogMeta) => log("info", message, meta),
  warn: (message: string, meta?: LogMeta) => log("warn", message, meta),
  error: (message: string, meta?: LogMeta) => log("error", message, meta),
  debug: (message: string, meta?: LogMeta) => log("debug", message, meta),

  request: (
    method: string,
    url: string,
    statusCode: number,
    durationMs: number,
    meta?: LogMeta,
  ) => {
    if (!isDev) {
      console.log(
        JSON.stringify({
          level:
            statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info",
          type: "api_response",
          method,
          url,
          statusCode,
          durationMs,
          timestamp: formatTimestamp(),
          ...meta,
        }),
      );
      return;
    }

    const line = `${formatMethod(method)} ${url} ${formatStatusCode(statusCode)} ${DIM}${formatDuration(durationMs)}${RESET}`;
    console.log(`${DIM}${formatTimestamp()}${RESET} ${line}`);
  },
};

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogMeta {
  [key: string]: unknown;
}

const LOG_COLORS: Record<LogLevel, string> = {
  info: "\x1b[36m", // cyan
  warn: "\x1b[33m", // yellow
  error: "\x1b[31m", // red
  debug: "\x1b[90m", // gray
};

const METHOD_COLORS: Record<string, string> = {
  GET: "\x1b[32m", // green
  POST: "\x1b[34m", // blue
  PATCH: "\x1b[33m", // yellow
  PUT: "\x1b[33m", // yellow
  DELETE: "\x1b[31m", // red
  OPTIONS: "\x1b[90m", // gray
};

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

const isDev = process.env.NODE_ENV !== "production";

const formatTimestamp = (): string => {
  const now = new Date();
  return now.toISOString().replace("T", " ").replace("Z", "");
};

const formatMeta = (meta?: LogMeta): string => {
  if (!meta || Object.keys(meta).length === 0) return "";
  return " " + JSON.stringify(meta);
};

const log = (level: LogLevel, message: string, meta?: LogMeta): void => {
  const color = LOG_COLORS[level];
  const timestamp = formatTimestamp();
  const tag = level.toUpperCase().padEnd(5);
  const metaStr = formatMeta(meta);

  const output = isDev
    ? `${DIM}${timestamp}${RESET} ${color}${BOLD}[${tag}]${RESET} ${message}${metaStr ? `${DIM}${metaStr}${RESET}` : ""}`
    : `${timestamp} [${tag}] ${message}${metaStr}`;

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    case "debug":
      if (isDev) console.debug(output);
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
  ) => {
    const line = `${formatMethod(method)} ${url} ${formatStatusCode(statusCode)} ${DIM}${formatDuration(durationMs)}${RESET}`;
    console.log(
      isDev
        ? `${DIM}${formatTimestamp()}${RESET} ${line}`
        : `${formatTimestamp()} ${method} ${url} ${statusCode} ${durationMs}ms`,
    );
  },
};

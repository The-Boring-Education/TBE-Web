import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { cors } from "@/lib/utils/cors";
import { sendAPIResponse } from "@/lib/utils/functions";
import { logger } from "@/lib/utils/logger";
import { captureAPIError } from "@/lib/utils/sentry";
import { connectDB } from "@/middleware/api";

interface ApiHandlerOptions {
  cors?: boolean;
  db?: boolean;
  maxBodyLogSize?: number;
}

const DEFAULT_OPTIONS: ApiHandlerOptions = {
  cors: true,
  db: true,
  maxBodyLogSize: 2048,
};

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "accesstoken",
  "refreshtoken",
  "clientsecret",
  "newpassword",
  "currentpassword",
  "oldpassword",
  "confirmpassword",
  "apikey",
  "cvv",
  "cardnumber",
  "x-admin-secret",
]);

function redactSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) return data;

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  if (typeof data === "object") {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(
      data as Record<string, unknown>,
    )) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lowerKey)) {
        redacted[key] = "[REDACTED]";
      } else {
        redacted[key] = redactSensitiveData(value);
      }
    }
    return redacted;
  }

  return data;
}

function extractRequestId(req: NextApiRequest): string {
  return (
    (req.headers["x-request-id"] as string) ||
    `fn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  );
}

function sanitizeBody(body: unknown, maxSize: number): unknown {
  if (!body) return undefined;
  try {
    const serialized = JSON.stringify(body);
    if (serialized.length > maxSize) {
      return `[truncated: ${serialized.length} chars]`;
    }
    return body;
  } catch {
    return "[unserializable body]";
  }
}

function extractErrorDetails(error: unknown): {
  message: string;
  stack?: string;
  name?: string;
  raw?: unknown;
} {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  if (typeof error === "string") {
    return { message: error };
  }
  return { message: "Unknown error", raw: error };
}

/**
 * Comprehensive API handler wrapper.
 * Composes: CORS + DB connection + structured logging + error boundary + Sentry.
 *
 * Usage:
 *   export default withApiHandler(handler)
 *   export default withApiHandler(handler, { db: false })
 */
const withApiHandler = (
  handler: NextApiHandler,
  options?: ApiHandlerOptions,
): NextApiHandler => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const start = Date.now();
    const requestId = extractRequestId(req);
    const { method = "UNKNOWN", url = "/" } = req;

    logger.info(`→ ${method} ${url}`, {
      requestId,
      query: redactSensitiveData(req.query),
      body: sanitizeBody(redactSensitiveData(req.body), opts.maxBodyLogSize!),
      contentType: req.headers["content-type"],
    });

    const originalJson = res.json.bind(res);
    let responseBody: unknown;

    res.json = function (body: unknown) {
      responseBody = body;
      return originalJson(body);
    } as typeof res.json;

    const originalEnd = res.end.bind(res);
    res.end = function (...args: Parameters<typeof res.end>) {
      const duration = Date.now() - start;
      const logMeta: Record<string, unknown> = { requestId };

      if (res.statusCode >= 400 && responseBody) {
        logMeta.responseBody = sanitizeBody(
          redactSensitiveData(responseBody),
          opts.maxBodyLogSize!,
        );
      }

      logger.request(method, url, res.statusCode, duration, logMeta);
      return originalEnd(...args);
    } as typeof res.end;

    try {
      if (opts.cors) {
        await cors(req, res);
      }

      if (opts.db) {
        await connectDB();
      }

      await handler(req, res);
    } catch (error) {
      const duration = Date.now() - start;
      const details = extractErrorDetails(error);

      logger.error(`UNHANDLED ${method} ${url}`, {
        requestId,
        durationMs: duration,
        error: details.message,
        errorName: details.name,
        stack: details.stack,
        body: sanitizeBody(redactSensitiveData(req.body), opts.maxBodyLogSize!),
        query: redactSensitiveData(req.query),
      });

      captureAPIError(
        error instanceof Error ? error : new Error(details.message),
        url,
        method,
        500,
        {
          body: redactSensitiveData(req.body),
          query: redactSensitiveData(req.query),
        },
      );

      if (!res.headersSent) {
        res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
          sendAPIResponse({
            status: false,
            error: true,
            message: "Internal server error",
          }),
        );
      }
    }
  };
};

export { withApiHandler };

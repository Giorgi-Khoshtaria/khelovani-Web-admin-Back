import { Request, Response, NextFunction } from "express";
import RequestLog from "../../modules/requestLog.modules.js";

const SENSITIVE_FIELDS = [
  "password",
  "newPassword",
  "oldPassword",
  "currentPassword",
  "confirmPassword",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "apiKey",
  "authorization",
];

const MAX_BODY_BYTES = 10_000;

const sanitizeBody = (body: unknown): unknown => {
  if (!body || typeof body !== "object") return body;
  if (Array.isArray(body)) return body.map(sanitizeBody);
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (SENSITIVE_FIELDS.includes(key)) {
      out[key] = "[REDACTED]";
    } else if (value && typeof value === "object") {
      out[key] = sanitizeBody(value);
    } else {
      out[key] = value;
    }
  }
  return out;
};

const truncate = (body: unknown): unknown => {
  try {
    const json = JSON.stringify(body);
    if (json.length <= MAX_BODY_BYTES) return body;
    return { _truncated: true, preview: json.slice(0, MAX_BODY_BYTES) };
  } catch {
    return { _unserializable: true };
  }
};

const deriveSource = (url: string): "user" | "partner" | "admin" | "public" => {
  if (url.startsWith("/api/admin")) return "admin";
  if (url.startsWith("/api/partner")) return "partner";
  if (url.startsWith("/api/user")) return "user";
  return "public";
};

const shouldSkip = (req: Request): boolean => {
  if (req.method === "OPTIONS") return true;
  if (req.originalUrl === "/" || req.originalUrl === "") return true;
  if (req.originalUrl.startsWith("/api/admin/logs")) return true;
  return false;
};

const extractIp = (req: Request): string | null => {
  const xRealIp = req.headers["x-real-ip"];
  const raw =
    (Array.isArray(xRealIp) ? xRealIp[0] : xRealIp) ||
    req.ip ||
    req.socket?.remoteAddress ||
    null;
  if (!raw) return null;
  const stripped = raw.replace(/^::ffff:/, "");
  return stripped || null;
};

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (shouldSkip(req)) return next();

  const startTime = Date.now();
  const bodySnapshot = req.body;
  const ip = extractIp(req);

  res.on("finish", () => {
    const statusCode = res.statusCode;
    const responseTimeMs = Date.now() - startTime;
    const isError = statusCode >= 400;

    const payload: Record<string, unknown> = {
      method: req.method,
      url: req.originalUrl,
      statusCode,
      responseTimeMs,
      source: deriveSource(req.originalUrl),
      ip,
      userAgent: req.get("user-agent") || null,
      userId: req.user?.id || null,
      userRole: req.user?.role || null,
    };

    if (isError) {
      payload.requestBody = truncate(sanitizeBody(bodySnapshot));
      payload.errorMessage =
        (res.locals?.errorMessage as string | undefined) || null;
      payload.errorStack =
        (res.locals?.errorStack as string | undefined) || null;
    }

    RequestLog.create(payload).catch((err) => {
      console.error("[requestLogger] failed to persist log:", err?.message);
    });
  });

  next();
};

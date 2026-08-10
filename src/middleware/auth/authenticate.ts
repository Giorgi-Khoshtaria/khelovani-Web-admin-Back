import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

// ✅ Extend Express Request so req.user is available everywhere
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        permissions: string[];
        allowedPanels: string[];
        partnerType?: string;
      };
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // ✅ Skip authentication for OPTIONS preflight requests
  if (req.method === "OPTIONS") {
    return next();
  }

  // httpOnly cookie (web frontend) takes precedence; Bearer header is the
  // fallback for the admin frontend and server-side rendered requests.
  const token =
    req.cookies?.["access-token"] ?? req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "ავტორიზაცია საჭიროა" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded as Request["user"];
    next();
  } catch {
    res.status(401).json({ message: "არასწორი ან ვადაგასული ტოკენი" });
  }
};

/**
 * ✅ Optional Authentication Middleware
 * If a token is provided and valid, it sets req.user.
 * If no token is provided — OR a token is present but invalid/expired — it
 * continues as an anonymous request rather than rejecting.
 *
 * This must never hard-fail: a browser that's "logged out" from the app's
 * perspective can still be holding a stale/expired `access-token` cookie
 * (the httpOnly cookie can't be cleared from JS, so it lingers until the
 * next login). Routes using this middleware are public GETs reachable with
 * no token at all, so treating a bad token as 401 gained nothing — it only
 * meant the frontend's global "redirect to /login on 401" interceptor fired
 * on a public page for someone who was never required to be logged in.
 */
export const optionalAuthenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const token =
    req.cookies?.["access-token"] ?? req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded as Request["user"];
  } catch {
    // Invalid/expired — fall back to anonymous instead of rejecting.
  }
  next();
};

import type { Response, CookieOptions } from "express";

/**
 * Auth cookies for the web frontend.
 *
 * - `access-token` is httpOnly so browser JS can never read it (XSS-safe);
 *   the browser attaches it automatically on requests to the API.
 * - `logged_in` carries no secret — it's a readable flag so the client can
 *   tell whether a session exists without probing a protected endpoint.
 *
 * Kept in sync with the JWT lifetime in `generateJWTToken` (7d).
 */
export const AUTH_COOKIE = "access-token";
export const LOGGED_IN_COOKIE = "logged_in";

const isProd = process.env.NODE_ENV === "production";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const baseOptions: CookieOptions = {
  sameSite: "lax",
  secure: isProd, // over plain http in dev `Secure` would drop the cookie
  path: "/",
};

export const setAuthCookies = (res: Response, token: string): void => {
  res.cookie(AUTH_COOKIE, token, {
    ...baseOptions,
    httpOnly: true,
    maxAge: MAX_AGE_MS,
  });
  res.cookie(LOGGED_IN_COOKIE, "1", {
    ...baseOptions,
    httpOnly: false,
    maxAge: MAX_AGE_MS,
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie(AUTH_COOKIE, { ...baseOptions, httpOnly: true });
  res.clearCookie(LOGGED_IN_COOKIE, { ...baseOptions, httpOnly: false });
};

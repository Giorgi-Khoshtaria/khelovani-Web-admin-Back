import { APIRequestContext, expect } from "@playwright/test";
import * as jwt from "jsonwebtoken";
import { ENDPOINTS } from "../../../constants/endpoints.js";

/**
 * Admin Login helper
 */
export const adminLogin = (api: APIRequestContext, payload: { email: string; password: string }) =>
  api.post(`${ENDPOINTS.ADMIN_LOGIN}?lang=en`, { data: payload });

/**
 * Validates JWT token contents for admin
 */
export const validateAdminToken = (token: string) => {
  try {
    const decoded = jwt.decode(token) as any;
    expect(decoded).toHaveProperty("id");
    expect(decoded).toHaveProperty("role");
    expect(decoded).toHaveProperty("permissions");
    expect(decoded).toHaveProperty("allowedPanels");
    expect(Array.isArray(decoded.permissions)).toBe(true);
    expect(Array.isArray(decoded.allowedPanels)).toBe(true);
    expect(decoded.role).toBe("admin");
    return decoded;
  } catch (error) {
    throw new Error("Invalid JWT token");
  }
};

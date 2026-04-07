import { APIRequestContext } from "@playwright/test";
import * as jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { ENDPOINTS } from "../../../constants/endpoints.js";

export interface AdminTokenPayload extends JwtPayload {
  id: string;
  role: string;
  permissions: string[];
  allowedPanels: string[];
}

export const adminLogin = (
  api: APIRequestContext,
  payload: { email: string; password: string },
) => api.post(`${ENDPOINTS.ADMIN_LOGIN}?lang=en`, { data: payload });

export const validateAdminToken = (token: string): AdminTokenPayload => {
  const decoded = jwt.decode(token) as AdminTokenPayload | null;

  if (!decoded || typeof decoded !== "object") {
    throw new Error(`Token could not be decoded: ${token}`);
  }

  const required = ["id", "role", "permissions", "allowedPanels"] as const;
  for (const field of required) {
    if (!(field in decoded)) {
      throw new Error(`Token missing field: "${field}"`);
    }
  }

  if (!Array.isArray(decoded.permissions)) {
    throw new Error("Token field 'permissions' is not an array");
  }
  if (!Array.isArray(decoded.allowedPanels)) {
    throw new Error("Token field 'allowedPanels' is not an array");
  }
  if (decoded.role !== "admin") {
    throw new Error(`Expected role "admin", got "${decoded.role}"`);
  }

  return decoded;
};

// Helper to delete a user by email using the test utility endpoint
export const deleteUserByEmail = async (
  api: APIRequestContext,
  email: string,
) => {
  return api.delete("/api/user/delete-by-email", {
    data: { email },
    headers: { "x-test-bypass": "khelovani-test-2026" },
  });
};
import { APIRequestContext } from "@playwright/test";
import { ENDPOINTS, DEFAULT_USER } from "../../../constants/endpoints.js";
import { randomId, randomEmail } from "../../../helpers/utils/generators.js";
import { CreatedUser } from "../../../fixtures/user.fixture.js";

export const register = (
  api: APIRequestContext,
  overrides: Record<string, any> = {},
  bypassLimiter: boolean = false,
) =>
  api.post(ENDPOINTS.REGISTER, {
    data: { ...DEFAULT_USER, ...overrides },
    headers: bypassLimiter ? { "x-test-bypass": "khelovani-test-2026" } : {},
  });

export const registerAndTrack = async (
  api: APIRequestContext,
  createdUsers: CreatedUser[],
  overrides: Record<string, any> = {},
  bypassLimiter: boolean = false,
) => {
  const email = overrides.email ?? randomEmail();
  const idNumber = overrides.idNumber ?? randomId();
  const res = await register(api, { ...overrides, email, idNumber }, bypassLimiter);

  if (res.status() === 201 || res.status() === 200) {
    createdUsers.push({ email, idNumber, password: DEFAULT_USER.password });
  }
  return { res, email, idNumber };
};

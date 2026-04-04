import { APIRequestContext } from "@playwright/test";
import { ENDPOINTS, DEFAULT_USER } from "../../../constants/endpoints.js";
import { randomId, randomEmail } from "../../../helpers/utils/generators.js";
import { CreatedUser } from "../../../fixtures/auth.fixture.js";

export const register = (
  api: APIRequestContext,
  overrides: Record<string, any> = {},
) => api.post(ENDPOINTS.REGISTER, { data: { ...DEFAULT_USER, ...overrides } });

export const registerAndTrack = async (
  api: APIRequestContext,
  createdUsers: CreatedUser[],
  overrides: Record<string, any> = {},
) => {
  const email = overrides.email ?? randomEmail();
  const idNumber = overrides.idNumber ?? randomId();
  const res = await register(api, { ...overrides, email, idNumber });

  if (res.status() === 201 || res.status() === 200) {
    createdUsers.push({ email, idNumber, password: DEFAULT_USER.password });
  }
  return { res, email, idNumber };
};

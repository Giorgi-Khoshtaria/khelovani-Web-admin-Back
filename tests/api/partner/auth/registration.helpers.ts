import { APIRequestContext } from "@playwright/test";
import { ENDPOINTS, DEFAULT_PARTNER } from "../../../constants/endpoints.js";
import { randomId, randomEmail } from "../../../helpers/utils/generators.js";
import { CreatedPartner } from "../../../fixtures/partner.fixture.js";

export const registerPartner = (api: APIRequestContext, overrides: Record<string, any> = {}) =>
  api.post(ENDPOINTS.PARTNER_REGISTER, {
    data: { ...DEFAULT_PARTNER, ...overrides },
  });

export const registerPartnerAndTrack = async (
  api: APIRequestContext,
  createdPartners: CreatedPartner[],
  overrides: Record<string, any> = {},
) => {
  const email = overrides.email ?? randomEmail();
  const identificationCode = overrides.identificationCode ?? randomId().slice(0, 9);

  const res = await registerPartner(api, {
    ...overrides,
    email,
    identificationCode,
  });

  if (res.status() === 201) {
    createdPartners.push({ email, identificationCode });
  }

  return { res, email, identificationCode };
};

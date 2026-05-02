import { APIRequestContext } from "@playwright/test";
import { ENDPOINTS, DEFAULT_PARTNER, DEFAULT_INDIVIDUAL_PARTNER } from "../../../constants/endpoints.js";
import { randomId, randomEmail } from "../../../helpers/utils/generators.js";
import { CreatedPartner } from "../../../fixtures/partner.fixture.js";

// ─── Raw request helpers ──────────────────────────────────────────────────────

export const registerPartner = (api: APIRequestContext, overrides: Record<string, any> = {}) =>
  api.post(ENDPOINTS.PARTNER_REGISTER, {
    data: { ...DEFAULT_PARTNER, ...overrides },
  });

export const registerIndividualPartner = (
  api: APIRequestContext,
  overrides: Record<string, any> = {},
) =>
  api.post(ENDPOINTS.PARTNER_REGISTER, {
    data: { ...DEFAULT_INDIVIDUAL_PARTNER, ...overrides },
  });

// ─── Scenario helpers (auto-fill unique required fields) ─────────────────────
// Use these in validation tests so you only specify the field under test,
// not the boilerplate email/identificationCode/personalNumber on every line.

/**
 * Register an ORGANIZATION partner with a fresh email + identificationCode.
 * Override only the field you want to test:
 *   registerOrgWith(api, { companyNameGe: "" })
 */
export const registerOrgWith = (
  api: APIRequestContext,
  overrides: Record<string, any> = {},
) =>
  registerPartner(api, {
    email: randomEmail(),
    identificationCode: randomId().slice(0, 9),
    ...overrides,
  });

/**
 * Register an INDIVIDUAL partner with a fresh email + personalNumber.
 * Override only the field you want to test:
 *   registerIndWith(api, { personalNumber: "1234567890" })
 */
export const registerIndWith = (
  api: APIRequestContext,
  overrides: Record<string, any> = {},
) =>
  registerIndividualPartner(api, {
    email: randomEmail(),
    personalNumber: randomId(),
    ...overrides,
  });

// ─── Tracking helpers (register + push to fixture cleanup list) ───────────────

export const registerPartnerAndTrack = async (
  api: APIRequestContext,
  createdPartners: CreatedPartner[],
  overrides: Record<string, any> = {},
) => {
  const email = overrides.email ?? randomEmail();
  const identificationCode = overrides.identificationCode ?? randomId().slice(0, 9);

  const res = await registerPartner(api, { ...overrides, email, identificationCode });

  if (res.status() === 201) {
    createdPartners.push({ email, identificationCode });
  }

  return { res, email, identificationCode };
};

export const registerIndividualAndTrack = async (
  api: APIRequestContext,
  createdPartners: CreatedPartner[],
  overrides: Record<string, any> = {},
) => {
  const email = overrides.email ?? randomEmail();
  const personalNumber = overrides.personalNumber ?? randomId();

  const res = await registerIndividualPartner(api, { ...overrides, email, personalNumber });

  if (res.status() === 201) {
    // identificationCode is irrelevant for individuals; cleanup is by email.
    createdPartners.push({ email, identificationCode: "" });
  }

  return { res, email, personalNumber };
};

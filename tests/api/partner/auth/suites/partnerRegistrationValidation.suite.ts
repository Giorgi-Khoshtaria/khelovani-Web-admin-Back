import { test, PartnerFixtures } from "../../../../fixtures/partner.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS, DEFAULT_INDIVIDUAL_PARTNER } from "../../../../constants/endpoints.js";
import { randomId, randomEmail } from "../../../../helpers/utils/generators.js";
import {
  registerPartner,
  registerPartnerAndTrack,
  registerIndividualPartner,
  registerIndividualAndTrack,
  registerOrgWith,
  registerIndWith,
} from "../registration.helpers.js";
import {
  emailValidationScenarios,
  phoneValidationScenarios,
  cityValidationScenarios,
  partnerOrgRequiredFieldScenarios,
  partnerIndRequiredFieldScenarios,
} from "../../../../helpers/shared/validation.helper.js";

export const partnerRegistrationValidationSuites = () => {
  // ─── Conflict (409) — Organization ───────────────────────────────
  test.describe("2. Conflict Handling (409) — Organization", () => {
    test("PRT-C001: 409 — duplicate email", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const sharedEmail = randomEmail();
      await registerPartnerAndTrack(api, createdPartners, { email: sharedEmail });

      const res = await registerPartner(api, { email: sharedEmail });
      expect(res.status()).toBe(409);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(typeof body.message).toBe("string");
      expect(body.message.length).toBeGreaterThan(0);
    });

    test("PRT-C002: 409 — duplicate identificationCode", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const sharedCode = randomId().slice(0, 9);
      await registerPartnerAndTrack(api, createdPartners, { identificationCode: sharedCode });

      const res = await registerPartner(api, { identificationCode: sharedCode, email: randomEmail() });
      expect(res.status()).toBe(409);
      const body = await res.json();
      expect(body.success).toBe(false);
    });
  });

  // ─── Conflict (409) — Individual ─────────────────────────────────
  test.describe("3. Conflict Handling (409) — Individual", () => {
    test("PRT-IND-C001: 409 — duplicate personalNumber", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const personalNumber = randomId();
      const { res: first } = await registerIndividualAndTrack(api, createdPartners, { personalNumber });
      expect(first.status()).toBe(201);

      const second = await registerIndividualPartner(api, { email: randomEmail(), personalNumber });
      expect(second.status()).toBe(409);
      expect((await second.json()).success).toBe(false);
    });

    test("PRT-IND-C002: 409 — email already used by an ORGANIZATION", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const sharedEmail = randomEmail();
      await registerPartnerAndTrack(api, createdPartners, { email: sharedEmail });

      const res = await registerIndividualPartner(api, {
        email: sharedEmail,
        personalNumber: randomId(),
      });
      expect(res.status()).toBe(409);
      expect((await res.json()).success).toBe(false);
    });

    test("PRT-IND-C003: 409 — email already used by another INDIVIDUAL", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const sharedEmail = randomEmail();
      await registerIndividualAndTrack(api, createdPartners, { email: sharedEmail });

      const res = await registerIndividualPartner(api, {
        email: sharedEmail,
        personalNumber: randomId(),
      });
      expect(res.status()).toBe(409);
    });
  });

  // ─── Email Validation (422) — applies to both types ──────────────
  test.describe("4. Email Validation (422)", () => {
    for (const { id, field, value, note } of emailValidationScenarios) {
      test(`PRT-EMAIL-${id.split("-").pop()}: 422 — Email: ${note}`, async ({ api }: PartnerFixtures) => {
        const res = await registerOrgWith(api, { [field]: value });
        const body = await res.json().catch(() => ({}));
        expect(res.status(), `Expected 422 for: ${note}`).toBe(422);
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors).toContainEqual(expect.objectContaining({ field }));
      });
    }

    test("PRT-EMAIL-010: 422 — email is null", async ({ api }: PartnerFixtures) => {
      const res = await registerOrgWith(api, { email: null });
      expect(res.status()).toBe(422);
    });

    test("PRT-EMAIL-011: 422 — email longer than 254 characters", async ({ api }: PartnerFixtures) => {
      const res = await registerOrgWith(api, { email: "a".repeat(246) + "@test.com" });
      expect(res.status()).toBe(422);
    });
  });

  // ─── Phone Validation (422) ───────────────────────────────────────
  test.describe("5. Phone Validation (422)", () => {
    for (const { id, field, value, note } of phoneValidationScenarios) {
      test(`PRT-PHONE-${id.split("-").pop()}: 422 — Phone: ${note}`, async ({ api }: PartnerFixtures) => {
        const res = await registerOrgWith(api, { [field]: value });
        const body = await res.json().catch(() => ({}));
        expect(res.status(), `Expected 422 for: ${note}`).toBe(422);
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors).toContainEqual(expect.objectContaining({ field }));
      });
    }
  });

  // ─── City Validation (422) ────────────────────────────────────────
  test.describe("6. City Validation (422)", () => {
    for (const { id, field, value, note } of cityValidationScenarios) {
      test(`PRT-CITY-${id.split("-").pop()}: 422 — City: ${note}`, async ({ api }: PartnerFixtures) => {
        const res = await registerOrgWith(api, { [field]: value });
        const body = await res.json().catch(() => ({}));
        expect(res.status(), `Expected 422 for: ${note}`).toBe(422);
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors).toContainEqual(expect.objectContaining({ field }));
      });
    }
  });

  // ─── Required Fields (422) — Organization ────────────────────────
  test.describe("7. Required Fields (422) — Organization", () => {
    for (const { id, field, value, note } of partnerOrgRequiredFieldScenarios) {
      test(`${id}: 422 — ${note}`, async ({ api }: PartnerFixtures) => {
        const res = await registerOrgWith(api, { [field]: value });
        const body = await res.json().catch(() => ({}));
        expect(res.status(), `${id}: Expected 422 for ${note}`).toBe(422);
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors).toContainEqual(expect.objectContaining({ field }));
      });
    }

    test("PRT-MIS-001: 422 — missing email", async ({ api }: PartnerFixtures) => {
      const res = await registerPartner(api, {
        email: undefined as any,
        identificationCode: randomId().slice(0, 9),
      });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(Array.isArray(body.errors)).toBe(true);
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "email" }));
    });

    test("PRT-MIS-002: 422 — missing identificationCode", async ({ api }: PartnerFixtures) => {
      const res = await registerPartner(api, {
        identificationCode: undefined as any,
        email: randomEmail(),
      });
      expect(res.status()).toBe(422);
    });

    test("PRT-MIS-004: 422 — missing terms", async ({ api }: PartnerFixtures) => {
      const res = await registerOrgWith(api, { terms: undefined as any });
      expect(res.status()).toBe(422);
    });
  });

  // ─── Required Fields (422) — Individual ──────────────────────────
  test.describe("8. Required Fields (422) — Individual", () => {
    for (const { id, field, value, note } of partnerIndRequiredFieldScenarios) {
      test(`${id}: 422 — ${note}`, async ({ api }: PartnerFixtures) => {
        const res = await registerIndWith(api, { [field]: value });
        const body = await res.json().catch(() => ({}));
        expect(res.status(), `${id}: Expected 422 for ${note}`).toBe(422);
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors).toContainEqual(expect.objectContaining({ field }));
      });
    }

    test("PRT-IND-MIS-001: 422 — missing personalNumber", async ({ api }: PartnerFixtures) => {
      const res = await api.post(ENDPOINTS.PARTNER_REGISTER, {
        data: { ...DEFAULT_INDIVIDUAL_PARTNER, email: randomEmail(), personalNumber: undefined },
      });
      expect(res.status()).toBe(422);
    });

    test("PRT-IND-MIS-002: 422 — missing partnerType", async ({ api }: PartnerFixtures) => {
      const { partnerType: _removed, ...withoutType } = DEFAULT_INDIVIDUAL_PARTNER;
      const res = await api.post(ENDPOINTS.PARTNER_REGISTER, {
        data: { ...withoutType, email: randomEmail(), personalNumber: randomId() },
      });
      expect(res.status()).toBe(422);
    });

    test("PRT-IND-MIS-003: 422 — missing email", async ({ api }: PartnerFixtures) => {
      const res = await registerIndividualPartner(api, {
        email: undefined as any,
        personalNumber: randomId(),
      });
      expect(res.status()).toBe(422);
    });
  });
};

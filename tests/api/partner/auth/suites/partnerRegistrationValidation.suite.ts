import { test, PartnerFixtures } from "../../../../fixtures/partner.fixture.js";
import { expect } from "@playwright/test";
import { randomId, randomEmail } from "../../../../helpers/utils/generators.js";
import {
  registerPartner,
  registerPartnerAndTrack,
} from "../registration.helpers.js";
import {
  emailValidationScenarios,
  phoneValidationScenarios,
  cityValidationScenarios,
} from "../../../../helpers/shared/validation.helper.js";

export const partnerRegistrationValidationSuites = () => {
  // ─── Conflict (409) ──────────────────────────────────────────────
  test.describe("2. Conflict Handling (409)", () => {
    test("PRT-C001: 409 — duplicate email", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const sharedEmail = randomEmail();
      await registerPartnerAndTrack(api, createdPartners, { email: sharedEmail });

      const res = await registerPartner(api, { email: sharedEmail });
      expect(res.status()).toBe(409);
      const body = await res.json();
      expect(typeof body.message).toBe("string");
      expect(body.message.length).toBeGreaterThan(0);
    });

    test("PRT-C002: 409 — duplicate identification code", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const sharedCode = randomId().slice(0, 9);
      await registerPartnerAndTrack(api, createdPartners, { identificationCode: sharedCode });

      const res = await registerPartner(api, { identificationCode: sharedCode });
      expect(res.status()).toBe(409);
      const body = await res.json();
      expect(typeof body.message).toBe("string");
    });
  });

  // ─── Email Validation ────────────────────────────────────────────
  test.describe("3. Email Validation (422)", () => {
    emailValidationScenarios.forEach(({ id, field, value, note }) => {
      test(`PRT-EMAIL-${id.split("-").pop()}: 422 — Email: ${note}`, async ({ api }: PartnerFixtures) => {
        const res = await registerPartner(api, { [field]: value, identificationCode: randomId().slice(0, 9) });
        const body = await res.json().catch(() => ({}));
        expect(res.status(), `Expected 422 for: ${note}`).toBe(422);
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors).toContainEqual(expect.objectContaining({ field }));
      });
    });

    test("PRT-EMAIL-010: 422 — email is null", async ({ api }: PartnerFixtures) => {
      const res = await registerPartner(api, { email: null });
      expect(res.status()).toBe(422);
    });

    test("PRT-EMAIL-011: 422 — email longer than 254 characters", async ({ api }: PartnerFixtures) => {
      const res = await registerPartner(api, { email: "a".repeat(246) + "@test.com" });
      expect(res.status()).toBe(422);
    });
  });

  // ─── Phone Validation ────────────────────────────────────────────
  test.describe("4. Phone Validation (422)", () => {
    phoneValidationScenarios.forEach(({ id, field, value, note }) => {
      test(`PRT-PHONE-${id.split("-").pop()}: 422 — Phone: ${note}`, async ({ api }: PartnerFixtures) => {
        const res = await registerPartner(api, { [field]: value, email: randomEmail() });
        const body = await res.json().catch(() => ({}));
        expect(res.status(), `Expected 422 for: ${note}`).toBe(422);
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors).toContainEqual(expect.objectContaining({ field }));
      });
    });
  });

  // ─── City Validation ─────────────────────────────────────────────
  test.describe("5. City Validation (422)", () => {
    cityValidationScenarios.forEach(({ id, field, value, note }) => {
      test(`PRT-CITY-${id.split("-").pop()}: 422 — City: ${note}`, async ({ api }: PartnerFixtures) => {
        const res = await registerPartner(api, { [field]: value, email: randomEmail() });
        const body = await res.json().catch(() => ({}));
        expect(res.status(), `Expected 422 for: ${note}`).toBe(422);
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors).toContainEqual(expect.objectContaining({ field }));
      });
    });
  });

  // ─── Required Field Validation ───────────────────────────────────
  test.describe("6. Required Field Validation (422)", () => {
    const requiredFieldScenarios = [
      { id: "PRT-006", field: "companyNameGe", value: "", note: "empty companyNameGe" },
      { id: "PRT-007", field: "companyNameEn", value: "", note: "empty companyNameEn" },
      { id: "PRT-008", field: "identificationCode", value: "", note: "empty identificationCode" },
      { id: "PRT-012", field: "contactPerson", value: "", note: "empty contactPerson" },
      { id: "PRT-016", field: "category", value: "", note: "empty category" },
      { id: "PRT-023", field: "terms", value: false, note: "terms not accepted" },
      { id: "PRT-024", field: "terms", value: null as any, note: "terms = null" },
    ];

    for (const { id, field, value, note } of requiredFieldScenarios) {
      test(`${id}: 422 — ${note}`, async ({ api }: PartnerFixtures) => {
        const overrides: Record<string, any> = { [field]: value };
        if (field !== "email") overrides.email = randomEmail();
        if (field !== "identificationCode") overrides.identificationCode = randomId().slice(0, 9);
        const res = await registerPartner(api, overrides);
        const body = await res.json().catch(() => ({}));
        expect(res.status(), `${id}: Expected 422 for ${note}`).toBe(422);
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors).toContainEqual(expect.objectContaining({ field }));
      });
    }
  });

  // ─── Address Validation ──────────────────────────────────────────
  test.describe("7. Address Validation (422)", () => {
    test("PRT-ADDR-001: 422 — address with non-Georgian characters", async ({ api }: PartnerFixtures) => {
      const res = await registerPartner(api, { address: "123 Main Street", email: randomEmail() });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "address" }));
    });

    test("PRT-ADDR-002: 422 — addressEn with non-English characters", async ({ api }: PartnerFixtures) => {
      const res = await registerPartner(api, { addressEn: "123 მთავარი ქუჩა", email: randomEmail() });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "addressEn" }));
    });

    test("PRT-ADDR-003: 422 — address too long (>200 chars)", async ({ api }: PartnerFixtures) => {
      const res = await registerPartner(api, { address: "ა".repeat(201), email: randomEmail() });
      expect(res.status()).toBe(422);
    });

    test("PRT-ADDR-004: 422 — addressEn too long (>200 chars)", async ({ api }: PartnerFixtures) => {
      const res = await registerPartner(api, { addressEn: "A".repeat(201), email: randomEmail() });
      expect(res.status()).toBe(422);
    });

    test("PRT-ADDR-005: 422 — empty address string", async ({ api }: PartnerFixtures) => {
      const res = await registerPartner(api, { address: "", email: randomEmail() });
      expect(res.status()).toBe(422);
    });
  });

  // ─── Missing Required Fields ─────────────────────────────────────
  test.describe("9. Missing Required Fields (422)", () => {
    test("PRT-MIS-001: 422 — missing email", async ({ api }: PartnerFixtures) => {
      const res = await registerPartner(api, { email: undefined as any });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(Array.isArray(body.errors)).toBe(true);
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "email" }));
    });

    test("PRT-MIS-002: 422 — missing identificationCode", async ({ api }: PartnerFixtures) => {
      const res = await registerPartner(api, { identificationCode: undefined as any, email: randomEmail() });
      expect(res.status()).toBe(422);
    });

    test("PRT-MIS-003: 422 — missing category", async ({ api }: PartnerFixtures) => {
      const res = await registerPartner(api, { category: undefined as any, email: randomEmail() });
      expect(res.status()).toBe(422);
    });

    test("PRT-MIS-004: 422 — missing terms field", async ({ api }: PartnerFixtures) => {
      const res = await registerPartner(api, { terms: undefined as any, email: randomEmail() });
      expect(res.status()).toBe(422);
    });
  });
};

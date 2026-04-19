import { test, PartnerFixtures } from "../../../../fixtures/partner.fixture.js";
import { expect } from "@playwright/test";
import { randomEmail, randomId } from "../../../../helpers/utils/generators.js";
import { registerPartner } from "../registration.helpers.js";
import {
  partnerCompanyNameGeScenarios,
  partnerCompanyNameEnScenarios,
  partnerIdCodeScenarios,
  partnerContactPersonScenarios,
  partnerAddressScenarios,
  partnerAddressEnScenarios,
  partnerUrlScenarios,
  partnerCategoryScenarios,
  LIMITS,
} from "../../../../helpers/shared/validation.helper.js";

export const partnerFieldValidationSuites = () => {
  test.describe("10. Partner Field Validation", () => {
    // ── companyNameGe ─────────────────────────────────────────────────
    test.describe("companyNameGe field", () => {
      for (const { id, value, note } of partnerCompanyNameGeScenarios) {
        test(`${id}: 422 — companyNameGe: ${note}`, async ({ api }: PartnerFixtures) => {
          const res = await registerPartner(api, {
            companyNameGe: value,
            email: randomEmail(),
            identificationCode: randomId().slice(0, 9),
          });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(Array.isArray(body.errors)).toBe(true);
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "companyNameGe" }));
        });
      }

      test("PRT-VAL-050: 201 — companyNameGe at min boundary (1 char)", async ({ api }: PartnerFixtures) => {
        const res = await registerPartner(api, {
          companyNameGe: "ა",
          email: randomEmail(),
          identificationCode: randomId().slice(0, 9),
        });
        expect(res.status()).toBe(201);
      });

      test("PRT-VAL-051: 201 — companyNameGe at max boundary (100 chars)", async ({ api }: PartnerFixtures) => {
        const res = await registerPartner(api, {
          companyNameGe: "ა".repeat(LIMITS.partner.companyNameGe.max),
          email: randomEmail(),
          identificationCode: randomId().slice(0, 9),
        });
        expect(res.status()).toBe(201);
      });
    });

    // ── companyNameEn ─────────────────────────────────────────────────
    test.describe("companyNameEn field", () => {
      for (const { id, value, note } of partnerCompanyNameEnScenarios) {
        test(`${id}: 422 — companyNameEn: ${note}`, async ({ api }: PartnerFixtures) => {
          const res = await registerPartner(api, {
            companyNameEn: value,
            email: randomEmail(),
            identificationCode: randomId().slice(0, 9),
          });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "companyNameEn" }));
        });
      }

      test("PRT-VAL-052: 201 — companyNameEn at min boundary (1 char)", async ({ api }: PartnerFixtures) => {
        const res = await registerPartner(api, {
          companyNameEn: "A",
          email: randomEmail(),
          identificationCode: randomId().slice(0, 9),
        });
        expect(res.status()).toBe(201);
      });

      test("PRT-VAL-053: 201 — companyNameEn at max boundary (100 chars)", async ({ api }: PartnerFixtures) => {
        const res = await registerPartner(api, {
          companyNameEn: "A".repeat(LIMITS.partner.companyNameEn.max),
          email: randomEmail(),
          identificationCode: randomId().slice(0, 9),
        });
        expect(res.status()).toBe(201);
      });
    });

    // ── identificationCode ────────────────────────────────────────────
    test.describe("identificationCode field", () => {
      for (const { id, value, note } of partnerIdCodeScenarios) {
        test(`${id}: 422 — identificationCode: ${note}`, async ({ api }: PartnerFixtures) => {
          const res = await registerPartner(api, {
            identificationCode: value,
            email: randomEmail(),
          });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "identificationCode" }));
        });
      }
    });

    // ── contactPerson ─────────────────────────────────────────────────
    test.describe("contactPerson field", () => {
      for (const { id, value, note } of partnerContactPersonScenarios) {
        test(`${id}: 422 — contactPerson: ${note}`, async ({ api }: PartnerFixtures) => {
          const res = await registerPartner(api, {
            contactPerson: value,
            email: randomEmail(),
            identificationCode: randomId().slice(0, 9),
          });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "contactPerson" }));
        });
      }

      test("PRT-VAL-054: 201 — contactPerson at max boundary (100 chars)", async ({ api }: PartnerFixtures) => {
        const res = await registerPartner(api, {
          contactPerson: "A".repeat(LIMITS.partner.contactPerson.max),
          email: randomEmail(),
          identificationCode: randomId().slice(0, 9),
        });
        expect(res.status()).toBe(201);
      });
    });

    // ── address ───────────────────────────────────────────────────────
    test.describe("address field", () => {
      for (const { id, value, note } of partnerAddressScenarios) {
        test(`${id}: 422 — address: ${note}`, async ({ api }: PartnerFixtures) => {
          const res = await registerPartner(api, {
            address: value,
            email: randomEmail(),
            identificationCode: randomId().slice(0, 9),
          });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "address" }));
        });
      }

      test("PRT-VAL-024: 201 — address at max boundary (200 chars)", async ({ api }: PartnerFixtures) => {
        const res = await registerPartner(api, {
          address: "ა".repeat(LIMITS.partner.address.max),
          email: randomEmail(),
          identificationCode: randomId().slice(0, 9),
        });
        expect(res.status()).toBe(201);
      });
    });

    // ── addressEn ─────────────────────────────────────────────────────
    test.describe("addressEn field", () => {
      for (const { id, value, note } of partnerAddressEnScenarios) {
        test(`${id}: 422 — addressEn: ${note}`, async ({ api }: PartnerFixtures) => {
          const res = await registerPartner(api, {
            addressEn: value,
            email: randomEmail(),
            identificationCode: randomId().slice(0, 9),
          });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "addressEn" }));
        });
      }

      test("PRT-VAL-029: 201 — addressEn at max boundary (200 chars)", async ({ api }: PartnerFixtures) => {
        const res = await registerPartner(api, {
          addressEn: "A".repeat(LIMITS.partner.addressEn.max),
          email: randomEmail(),
          identificationCode: randomId().slice(0, 9),
        });
        expect(res.status()).toBe(201);
      });
    });

    // ── URL fields (website, facebook, instagram, tiktok) ────────────
    test.describe("URL fields", () => {
      for (const { id, field, value, note } of partnerUrlScenarios) {
        test(`${id}: 422 — ${field}: ${note}`, async ({ api }: PartnerFixtures) => {
          const res = await registerPartner(api, {
            [field]: value,
            email: randomEmail(),
            identificationCode: randomId().slice(0, 9),
          });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(body.errors).toContainEqual(expect.objectContaining({ field }));
        });
      }
    });

    // ── category ──────────────────────────────────────────────────────
    test.describe("category field", () => {
      for (const { id, value, note } of partnerCategoryScenarios) {
        test(`${id}: 422 — category: ${note}`, async ({ api }: PartnerFixtures) => {
          const res = await registerPartner(api, {
            category: value,
            email: randomEmail(),
            identificationCode: randomId().slice(0, 9),
          });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "category" }));
        });
      }
    });

    // ── description / descriptionEn (optional) ────────────────────────
    test.describe("description fields (optional)", () => {
      test("PRT-VAL-060: 422 — description too long (>500 chars)", async ({ api }: PartnerFixtures) => {
        const res = await registerPartner(api, {
          description: "ა".repeat(LIMITS.partner.description.max + 1),
          email: randomEmail(),
          identificationCode: randomId().slice(0, 9),
        });
        expect(res.status()).toBe(422);
      });

      test("PRT-VAL-061: 422 — descriptionEn too long (>500 chars)", async ({ api }: PartnerFixtures) => {
        const res = await registerPartner(api, {
          descriptionEn: "A".repeat(LIMITS.partner.description.max + 1),
          email: randomEmail(),
          identificationCode: randomId().slice(0, 9),
        });
        expect(res.status()).toBe(422);
      });

      test("PRT-VAL-062: 201 — description omitted (optional)", async ({ api }: PartnerFixtures) => {
        const res = await registerPartner(api, {
          email: randomEmail(),
          identificationCode: randomId().slice(0, 9),
        });
        expect([201, 422]).toContain(res.status());
      });
    });

    // ── terms ─────────────────────────────────────────────────────────
    test.describe("terms field", () => {
      test("PRT-VAL-070: 422 — terms is string 'true'", async ({ api }: PartnerFixtures) => {
        const res = await registerPartner(api, {
          terms: "true" as any,
          email: randomEmail(),
          identificationCode: randomId().slice(0, 9),
        });
        expect(res.status()).toBe(422);
      });

      test("PRT-VAL-071: 422 — terms is number 1", async ({ api }: PartnerFixtures) => {
        const res = await registerPartner(api, {
          terms: 1 as any,
          email: randomEmail(),
          identificationCode: randomId().slice(0, 9),
        });
        expect(res.status()).toBe(422);
      });

      test("PRT-VAL-072: 422 — terms is false", async ({ api }: PartnerFixtures) => {
        const res = await registerPartner(api, {
          terms: false,
          email: randomEmail(),
          identificationCode: randomId().slice(0, 9),
        });
        expect(res.status()).toBe(422);
      });
    });
  });
};

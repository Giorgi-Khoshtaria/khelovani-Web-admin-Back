import { test, PartnerFixtures } from "../../../../fixtures/partner.fixture.js";
import { expect } from "@playwright/test";
import { registerOrgWith, registerIndWith } from "../registration.helpers.js";
import {
  partnerCompanyNameGeScenarios,
  partnerCompanyNameEnScenarios,
  partnerIdCodeScenarios,
  partnerContactPersonScenarios,
  partnerAddressScenarios,
  partnerAddressEnScenarios,
  partnerUrlScenarios,
  partnerPersonalNumberScenarios,
  LIMITS,
} from "../../../../helpers/shared/validation.helper.js";

export const partnerFieldValidationSuites = () => {
  test.describe("10. Partner Field Validation — Organization", () => {
    // ── companyNameGe ─────────────────────────────────────────────────
    test.describe("companyNameGe", () => {
      for (const { id, value, note } of partnerCompanyNameGeScenarios) {
        test(`${id}: 422 — companyNameGe: ${note}`, async ({ api }: PartnerFixtures) => {
          const res = await registerOrgWith(api, { companyNameGe: value });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(Array.isArray(body.errors)).toBe(true);
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "companyNameGe" }));
        });
      }

      test("PRT-VAL-050: 201 — companyNameGe at min boundary (1 char)", async ({ api }: PartnerFixtures) => {
        const res = await registerOrgWith(api, { companyNameGe: "ა" });
        expect(res.status()).toBe(201);
      });

      test("PRT-VAL-051: 201 — companyNameGe at max boundary (100 chars)", async ({ api }: PartnerFixtures) => {
        const res = await registerOrgWith(api, { companyNameGe: "ა".repeat(LIMITS.partner.companyNameGe.max) });
        expect(res.status()).toBe(201);
      });
    });

    // ── companyNameEn ─────────────────────────────────────────────────
    test.describe("companyNameEn", () => {
      for (const { id, value, note } of partnerCompanyNameEnScenarios) {
        test(`${id}: 422 — companyNameEn: ${note}`, async ({ api }: PartnerFixtures) => {
          const res = await registerOrgWith(api, { companyNameEn: value });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "companyNameEn" }));
        });
      }

      test("PRT-VAL-052: 201 — companyNameEn at min boundary (1 char)", async ({ api }: PartnerFixtures) => {
        const res = await registerOrgWith(api, { companyNameEn: "A" });
        expect(res.status()).toBe(201);
      });

      test("PRT-VAL-053: 201 — companyNameEn at max boundary (100 chars)", async ({ api }: PartnerFixtures) => {
        const res = await registerOrgWith(api, { companyNameEn: "A".repeat(LIMITS.partner.companyNameEn.max) });
        expect(res.status()).toBe(201);
      });
    });

    // ── identificationCode ────────────────────────────────────────────
    test.describe("identificationCode", () => {
      for (const { id, value, note } of partnerIdCodeScenarios) {
        test(`${id}: 422 — identificationCode: ${note}`, async ({ api }: PartnerFixtures) => {
          const res = await registerOrgWith(api, { identificationCode: value });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "identificationCode" }));
        });
      }
    });

    // ── contactPerson ─────────────────────────────────────────────────
    test.describe("contactPerson", () => {
      for (const { id, value, note } of partnerContactPersonScenarios) {
        test(`${id}: 422 — contactPerson: ${note}`, async ({ api }: PartnerFixtures) => {
          const res = await registerOrgWith(api, { contactPerson: value });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "contactPerson" }));
        });
      }

      test("PRT-VAL-054: 201 — contactPerson at max boundary (100 chars)", async ({ api }: PartnerFixtures) => {
        const res = await registerOrgWith(api, { contactPerson: "A".repeat(LIMITS.partner.contactPerson.max) });
        expect(res.status()).toBe(201);
      });
    });

    // ── address ───────────────────────────────────────────────────────
    test.describe("address", () => {
      for (const { id, value, note } of partnerAddressScenarios) {
        test(`${id}: 422 — address: ${note}`, async ({ api }: PartnerFixtures) => {
          const res = await registerOrgWith(api, { address: value });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "address" }));
        });
      }

      test("PRT-VAL-024: 201 — address at max boundary (200 chars)", async ({ api }: PartnerFixtures) => {
        const res = await registerOrgWith(api, { address: "ა".repeat(LIMITS.partner.address.max) });
        expect(res.status()).toBe(201);
      });
    });

    // ── addressEn ─────────────────────────────────────────────────────
    test.describe("addressEn", () => {
      for (const { id, value, note } of partnerAddressEnScenarios) {
        test(`${id}: 422 — addressEn: ${note}`, async ({ api }: PartnerFixtures) => {
          const res = await registerOrgWith(api, { addressEn: value });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "addressEn" }));
        });
      }

      test("PRT-VAL-029: 201 — addressEn at max boundary (200 chars)", async ({ api }: PartnerFixtures) => {
        const res = await registerOrgWith(api, { addressEn: "A".repeat(LIMITS.partner.addressEn.max) });
        expect(res.status()).toBe(201);
      });
    });

    // ── URL fields ────────────────────────────────────────────────────
    test.describe("URL fields", () => {
      for (const { id, field, value, note } of partnerUrlScenarios) {
        test(`${id}: 422 — ${field}: ${note}`, async ({ api }: PartnerFixtures) => {
          const res = await registerOrgWith(api, { [field]: value });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(body.errors).toContainEqual(expect.objectContaining({ field }));
        });
      }
    });

    // ── description / descriptionEn (optional) ────────────────────────
    test.describe("description fields (optional)", () => {
      test("PRT-VAL-060: 422 — description too long (>500 chars)", async ({ api }: PartnerFixtures) => {
        const res = await registerOrgWith(api, { description: "ა".repeat(LIMITS.partner.description.max + 1) });
        expect(res.status()).toBe(422);
      });

      test("PRT-VAL-061: 422 — descriptionEn too long (>500 chars)", async ({ api }: PartnerFixtures) => {
        const res = await registerOrgWith(api, { descriptionEn: "A".repeat(LIMITS.partner.description.max + 1) });
        expect(res.status()).toBe(422);
      });
    });

    // ── terms ─────────────────────────────────────────────────────────
    test.describe("terms", () => {
      test("PRT-VAL-070: 422 — terms is string 'true'", async ({ api }: PartnerFixtures) => {
        const res = await registerOrgWith(api, { terms: "true" as any });
        expect(res.status()).toBe(422);
      });

      test("PRT-VAL-071: 422 — terms is number 1", async ({ api }: PartnerFixtures) => {
        const res = await registerOrgWith(api, { terms: 1 as any });
        expect(res.status()).toBe(422);
      });

      test("PRT-VAL-072: 422 — terms is false", async ({ api }: PartnerFixtures) => {
        const res = await registerOrgWith(api, { terms: false });
        expect(res.status()).toBe(422);
      });
    });
  });

  // ─── Individual (physical person) field validation ────────────────
  test.describe("11. Partner Field Validation — Individual", () => {
    // ── personalNumber ────────────────────────────────────────────────
    test.describe("personalNumber", () => {
      for (const { id, value, note } of partnerPersonalNumberScenarios) {
        test(`${id}: 422 — personalNumber: ${note}`, async ({ api }: PartnerFixtures) => {
          const res = await registerIndWith(api, { personalNumber: value });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(Array.isArray(body.errors)).toBe(true);
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "personalNumber" }));
        });
      }
    });

    // ── shared fields (companyNameGe, companyNameEn, address, addressEn) ──
    test.describe("companyNameGe", () => {
      for (const { id, value, note } of partnerCompanyNameGeScenarios) {
        test(`${id}-IND: 422 — individual companyNameGe: ${note}`, async ({ api }: PartnerFixtures) => {
          const res = await registerIndWith(api, { companyNameGe: value });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "companyNameGe" }));
        });
      }
    });

    test.describe("address", () => {
      for (const { id, value, note } of partnerAddressScenarios) {
        test(`${id}-IND: 422 — individual address: ${note}`, async ({ api }: PartnerFixtures) => {
          const res = await registerIndWith(api, { address: value });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "address" }));
        });
      }
    });

    test.describe("addressEn", () => {
      for (const { id, value, note } of partnerAddressEnScenarios) {
        test(`${id}-IND: 422 — individual addressEn: ${note}`, async ({ api }: PartnerFixtures) => {
          const res = await registerIndWith(api, { addressEn: value });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "addressEn" }));
        });
      }
    });

    test.describe("URL fields", () => {
      for (const { id, field, value, note } of partnerUrlScenarios) {
        test(`${id}-IND: 422 — individual ${field}: ${note}`, async ({ api }: PartnerFixtures) => {
          const res = await registerIndWith(api, { [field]: value });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(body.errors).toContainEqual(expect.objectContaining({ field }));
        });
      }
    });
  });
};

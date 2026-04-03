import { test, expect } from "../../helpers/userHelpers/fixtures.js";
import {
  ENDPOINTS,
  DEFAULT_PARTNER,
  REAL_EMAILS,
} from "../../helpers/userHelpers/constants.js";
import { randomId, randomEmail } from "../../helpers/userHelpers/generators.js";
import {
  emailValidationScenarios,
  phoneValidationScenarios,
  cityValidationScenarios,
  addressValidationScenarios,
} from "../../helpers/shared/sharedTestHelpers.js";

/**
 * ============================================================
 *  Partner Registration API — Improved Test Suite
 * ============================================================
 */

test.describe("Partner Registration API", () => {
  const createdPartners: Array<{ email: string; identificationCode: string }> =
    [];

  // ─── Helper Functions ────────────────────────────────────────

  const registerPartner = (api: any, overrides: Record<string, any> = {}) =>
    api.post(ENDPOINTS.PARTNER_REGISTER, {
      data: { ...DEFAULT_PARTNER, ...overrides },
    });

  const registerPartnerAndTrack = async (
    api: any,
    overrides: Record<string, any> = {},
  ) => {
    const email = overrides.email ?? randomEmail();
    const identificationCode =
      overrides.identificationCode ?? randomId().slice(0, 9);

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

  // Cleanup after all tests (runs even if some tests fail)
  test.afterAll(async ({ api }) => {
    if (createdPartners.length === 0) return;

    console.log(`🧹 Cleaning up ${createdPartners.length} created partners...`);

    for (const partner of createdPartners) {
      try {
        // TODO: Replace with your actual delete endpoint if available
        // Example: await api.delete(`${ENDPOINTS.PARTNER_DELETE}/${partner.identificationCode}`);
        console.log(`   Deleted partner: ${partner.email}`);
      } catch (e) {
        console.warn(`   Failed to delete partner ${partner.email}:`, e);
      }
    }

    createdPartners.length = 0; // clear the array
  });

  // ─── Happy Path ─────────────────────────────────────────────

  test.describe("Happy Path", () => {
    test("PRT-001: 201 — new partner registration", async ({ api }) => {
      const { res } = await registerPartnerAndTrack(api);
      expect(res.status()).toBe(201);
    });

    test("PRT-002: 201 — response contains success message", async ({
      api,
    }) => {
      const { res } = await registerPartnerAndTrack(api);
      expect(res.status()).toBe(201);

      const body = await res.json();
      expect(body).toHaveProperty("message");
      expect(typeof body.message).toBe("string");
      expect(body.message.length).toBeGreaterThan(5);
    });

    test("PRT-003: 201 — lang=ge returns Georgian message", async ({ api }) => {
      const email = randomEmail();
      const identificationCode = randomId().slice(0, 9);

      const res = await api.post(`${ENDPOINTS.PARTNER_REGISTER}?lang=ge`, {
        data: { ...DEFAULT_PARTNER, email, identificationCode },
      });

      expect(res.status()).toBe(201);

      const body = await res.json();
      expect(
        body.message,
        "Expected Georgian characters in lang=ge response",
      ).toMatch(/[\u10D0-\u10FF]/);

      createdPartners.push({ email, identificationCode });
    });
  });

  // ─── Conflict Handling (409) ─────────────────────────────────

  test.describe("Conflict Handling (409)", () => {
    test("PRT-004: 409 — duplicate email", async ({ api }) => {
      const sharedEmail = randomEmail();
      await registerPartnerAndTrack(api, { email: sharedEmail });

      const res = await registerPartner(api, { email: sharedEmail });
      expect(res.status()).toBe(409);

      const body = await res.json();
      expect(body).toHaveProperty("message");
      expect(typeof body.message).toBe("string");
    });

    test("PRT-005: 409 — duplicate identification code", async ({ api }) => {
      const sharedCode = randomId().slice(0, 9);
      await registerPartner(api, { identificationCode: sharedCode });

      const res = await registerPartner(api, {
        identificationCode: sharedCode,
      });
      expect(res.status()).toBe(409);

      const body = await res.json();
      expect(body).toHaveProperty("message");
    });
  });

  // ─── Field Validation (422) ──────────────────────────────────

  test.describe("Field Validation (422)", () => {
    const partnerSpecificScenarios = [
      {
        id: "PRT-006",
        field: "companyNameGe",
        value: "",
        note: "empty companyNameGe",
      },
      {
        id: "PRT-007",
        field: "companyNameEn",
        value: "",
        note: "empty companyNameEn",
      },
      {
        id: "PRT-008",
        field: "identificationCode",
        value: "",
        note: "empty identificationCode",
      },
      {
        id: "PRT-009",
        field: "identificationCode",
        value: "12345678",
        note: "short identificationCode (8 digits)",
      },
      {
        id: "PRT-010",
        field: "identificationCode",
        value: "1234567890",
        note: "long identificationCode (10 digits)",
      },
      {
        id: "PRT-011",
        field: "identificationCode",
        value: "12345678a",
        note: "identificationCode with non-digits",
      },
      {
        id: "PRT-012",
        field: "contactPerson",
        value: "",
        note: "empty contactPerson",
      },
      { id: "PRT-016", field: "category", value: "", note: "empty category" },
      {
        id: "PRT-017",
        field: "category",
        value: "invalid_category",
        note: "invalid category value",
      },
      {
        id: "PRT-023",
        field: "terms",
        value: false,
        note: "terms not accepted",
      },
      { id: "PRT-024", field: "terms", value: null, note: "terms = null" },
    ];

    const allScenarios = [
      ...partnerSpecificScenarios,
      ...phoneValidationScenarios.map((s) => ({
        ...s,
        id: s.id.replace("VAL-PHONE", "PRT-PHONE"),
      })),
      ...cityValidationScenarios.map((s) => ({
        ...s,
        id: s.id.replace("VAL-CITY", "PRT-CITY"),
      })),
      ...emailValidationScenarios.map((s) => ({
        ...s,
        id: s.id.replace("VAL-EMAIL", "PRT-EMAIL"),
      })),
    ];

    for (const { id, field, value, note } of allScenarios) {
      test(`${id}: 422 — ${note}`, async ({ api }) => {
        const res = await registerPartner(api, { [field]: value });
        const body = await res.json().catch(() => ({}));

        expect(res.status(), `${id}: Expected 422 for ${note}`).toBe(422);
        expect(
          Array.isArray(body.errors),
          "Response should contain errors array",
        ).toBe(true);
        expect(body.errors).toContainEqual(expect.objectContaining({ field }));
      });
    }
  });

  // ─── Address Validation ──────────────────────────────────────

  test.describe("Address Validation", () => {
    test("PRT-025: 422 — address with non-Georgian characters", async ({
      api,
    }) => {
      const res = await registerPartner(api, { address: "123 Main Street" });
      expect(res.status()).toBe(422);

      const body = await res.json();
      expect(body.errors).toContainEqual(
        expect.objectContaining({ field: "address" }),
      );
    });

    test("PRT-026: 422 — addressEn with non-English characters", async ({
      api,
    }) => {
      const res = await registerPartner(api, { addressEn: "123 მთავარი ქუჩა" });
      expect(res.status()).toBe(422);

      const body = await res.json();
      expect(body.errors).toContainEqual(
        expect.objectContaining({ field: "addressEn" }),
      );
    });
  });

  // ─── Bad Request / Protocol (400) ────────────────────────────

  test.describe("Bad Request / Protocol (400)", () => {
    test("PRT-027: 400 — empty object body {}", async ({ api }) => {
      const res = await api.post(ENDPOINTS.PARTNER_REGISTER, { data: {} });
      expect(res.status()).toBe(400);
    });

    test("PRT-028: 400 — malformed JSON", async ({ api }) => {
      const res = await api.post(ENDPOINTS.PARTNER_REGISTER, {
        headers: { "Content-Type": "application/json" },
        data: '{ "email": "broken" ', // intentionally malformed
      });
      expect(res.status()).toBe(400);
    });
  });

  // ─── Response Shape Contract ────────────────────────────────

  test.describe("Response Shape Contract", () => {
    test("PRT-029: 201 response has correct Content-Type", async ({ api }) => {
      const { res } = await registerPartnerAndTrack(api);
      expect(res.headers()["content-type"]).toContain("application/json");
    });

    test("PRT-030: 422 response includes errors array with field", async ({
      api,
    }) => {
      const res = await registerPartner(api, { email: "invalid-email" });
      const body = await res.json();

      expect(res.status()).toBe(422);
      expect(Array.isArray(body.errors)).toBe(true);
      expect(body.errors.length).toBeGreaterThan(0);
    });

    test("PRT-031: 409 response has message property", async ({ api }) => {
      const sharedEmail = randomEmail();
      await registerPartnerAndTrack(api, { email: sharedEmail });

      const res = await registerPartner(api, { email: sharedEmail });
      const body = await res.json();

      expect(res.status()).toBe(409);
      expect(typeof body.message).toBe("string");
      expect(body.message.length).toBeGreaterThan(0);
    });
  });
});

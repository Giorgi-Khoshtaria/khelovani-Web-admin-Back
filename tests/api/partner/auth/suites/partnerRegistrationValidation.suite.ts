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
  test.describe("2. Conflict Handling (409)", () => {
    test("PRT-004: 409 — duplicate email", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const sharedEmail = randomEmail();
      await registerPartnerAndTrack(api, createdPartners, {
        email: sharedEmail,
      });

      const res = await registerPartner(api, { email: sharedEmail });
      expect(res.status()).toBe(409);

      const body = await res.json();
      expect(body).toHaveProperty("message");
      expect(typeof body.message).toBe("string");
    });

    test("PRT-005: 409 — duplicate identification code", async ({
      api,
    }: PartnerFixtures) => {
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

  test.describe("3. Field Validation (422)", () => {
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
        id: "PRT-023",
        field: "terms",
        value: false,
        note: "terms not accepted",
      },
      {
        id: "PRT-024",
        field: "terms",
        value: null as any,
        note: "terms = null",
      },
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
      test(`${id}: 422 — ${note}`, async ({ api }: PartnerFixtures) => {
        const overrides = { [field]: value } as any;
        if (field !== "email") {
          overrides.email = randomEmail();
        }
        const res = await registerPartner(api, overrides);
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

  test.describe("4. Address Validation", () => {
    test("PRT-025: 422 — address with non-Georgian characters", async ({
      api,
    }: PartnerFixtures) => {
      const res = await registerPartner(api, { address: "123 Main Street" });
      expect(res.status()).toBe(422);

      const body = await res.json();
      expect(body.errors).toContainEqual(
        expect.objectContaining({ field: "address" }),
      );
    });

    test("PRT-026: 422 — addressEn with non-English characters", async ({
      api,
    }: PartnerFixtures) => {
      const res = await registerPartner(api, { addressEn: "123 მთავარი ქუჩა" });
      expect(res.status()).toBe(422);

      const body = await res.json();
      expect(body.errors).toContainEqual(
        expect.objectContaining({ field: "addressEn" }),
      );
    });
  });
};

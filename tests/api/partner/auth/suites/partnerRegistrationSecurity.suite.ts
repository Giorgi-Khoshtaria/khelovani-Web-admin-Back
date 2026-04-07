import { test, PartnerFixtures } from "../../../../fixtures/partner.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { randomId, randomEmail } from "../../../../helpers/utils/generators.js";
import {
  registerPartner,
  registerPartnerAndTrack,
} from "../registration.helpers.js";

export const partnerRegistrationSecuritySuites = () => {
  test.describe("5. Bad Request / Protocol (400)", () => {
    test("PRT-027: 422 — empty object body {}", async ({
      api,
    }: PartnerFixtures) => {
      const res = await api.post(ENDPOINTS.PARTNER_REGISTER, { data: {} });
      expect(res.status()).toBe(422);
    });

    test("PRT-028: 400 — malformed JSON", async ({ api }: PartnerFixtures) => {
      const res = await api.post(ENDPOINTS.PARTNER_REGISTER, {
        headers: { "Content-Type": "application/json" },
        data: '{ "email": "broken" ', // intentionally malformed
      });
      expect(res.status()).toBe(400);
    });
  });

  test.describe("6. Response Shape Contract", () => {
    test("PRT-029: 201 response has correct Content-Type", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const { res } = await registerPartnerAndTrack(api, createdPartners);
      expect(res.headers()["content-type"]).toContain("application/json");
    });

    test("PRT-030: 422 response includes errors array with field", async ({
      api,
    }: PartnerFixtures) => {
      const res = await registerPartner(api, { email: "invalid-email" });
      const body = await res.json();

      expect(res.status()).toBe(422);
      expect(Array.isArray(body.errors)).toBe(true);
      expect(body.errors.length).toBeGreaterThan(0);
    });

    test("PRT-031: 409 response has message property", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const sharedEmail = randomEmail();
      await registerPartnerAndTrack(api, createdPartners, {
        email: sharedEmail,
      });

      const res = await registerPartner(api, { email: sharedEmail });
      const body = await res.json();

      expect(res.status()).toBe(409);
      expect(typeof body.message).toBe("string");
      expect(body.message.length).toBeGreaterThan(0);
    });
  });
};

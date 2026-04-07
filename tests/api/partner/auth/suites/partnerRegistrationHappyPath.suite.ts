import { test, PartnerFixtures } from "../../../../fixtures/partner.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS, DEFAULT_PARTNER } from "../../../../constants/endpoints.js";
import { randomId, randomEmail } from "../../../../helpers/utils/generators.js";
import { registerPartnerAndTrack } from "../registration.helpers.js";

export const partnerRegistrationHappyPathSuites = () => {
  test.describe("1. Happy Path", () => {
    test("PRT-001: 201 — new partner registration", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const { res } = await registerPartnerAndTrack(api, createdPartners);
      expect(res.status()).toBe(201);
    });

    test("PRT-002: 201 — response contains success message", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const { res } = await registerPartnerAndTrack(api, createdPartners);
      expect(res.status()).toBe(201);

      const body = await res.json();
      expect(body).toHaveProperty("message");
      expect(typeof body.message).toBe("string");
      expect(body.message.length).toBeGreaterThan(5);
    });

    test("PRT-003: 201 — lang=ge returns Georgian message", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
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
};

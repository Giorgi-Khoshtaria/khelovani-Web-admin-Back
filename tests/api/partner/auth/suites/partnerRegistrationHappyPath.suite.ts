import { test, PartnerFixtures } from "../../../../fixtures/partner.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS, DEFAULT_PARTNER } from "../../../../constants/endpoints.js";
import { randomId, randomEmail } from "../../../../helpers/utils/generators.js";
import { registerPartner, registerPartnerAndTrack } from "../registration.helpers.js";

export const partnerRegistrationHappyPathSuites = () => {
  test.describe("1. Happy Path", () => {
    test("PRT-001: 201 — new partner registration returns 201", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const { res } = await registerPartnerAndTrack(api, createdPartners);
      expect(res.status()).toBe(201);
    });

    test("PRT-002: 201 — response contains success message string", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const { res } = await registerPartnerAndTrack(api, createdPartners);
      const body = await res.json();
      expect(body).toHaveProperty("message");
      expect(typeof body.message).toBe("string");
      expect(body.message.length).toBeGreaterThan(5);
    });

    test("PRT-003: 201 — response body has success: true", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const { res } = await registerPartnerAndTrack(api, createdPartners);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    test("PRT-004: 201 — response data contains partner _id and email", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const email = randomEmail();
      const { res } = await registerPartnerAndTrack(api, createdPartners, { email });
      const body = await res.json();
      expect(body.data).toBeDefined();
      expect(body.data.partner).toBeDefined();
      expect(typeof body.data.partner._id).toBe("string");
      expect(body.data.partner._id.length).toBeGreaterThan(0);
      expect(body.data.partner.email).toBe(email.toLowerCase());
    });

    test("PRT-005: 201 — password is never echoed in response", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const { res } = await registerPartnerAndTrack(api, createdPartners);
      const text = await res.text();
      // auto-generated password should not appear; no plaintext password in payload
      expect(text).not.toMatch(/password/i);
    });

    test("PRT-006: 201 — lang=ge returns Georgian message", async ({
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
      expect(body.message).toMatch(/[\u10D0-\u10FF]/);

      createdPartners.push({ email, identificationCode });
    });

    test("PRT-007: 201 — lang=en returns English message", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const email = randomEmail();
      const identificationCode = randomId().slice(0, 9);

      const res = await api.post(`${ENDPOINTS.PARTNER_REGISTER}?lang=en`, {
        data: { ...DEFAULT_PARTNER, email, identificationCode },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.message).toMatch(/[a-zA-Z]/);

      createdPartners.push({ email, identificationCode });
    });

    test("PRT-008: 201 — optional fields (website, facebook, description) accepted", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const { res } = await registerPartnerAndTrack(api, createdPartners, {
        website: "https://mysite.com",
        facebook: "https://facebook.com/mypage",
        instagram: "https://instagram.com/mypage",
        tiktok: "https://tiktok.com/@mypage",
        description: "ეს არის აღწერა",
        descriptionEn: "This is a description",
      });
      expect(res.status()).toBe(201);
    });

    test("PRT-009: 201 — optional social fields omitted still succeeds", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const { res } = await registerPartnerAndTrack(api, createdPartners, {
        website: undefined,
        facebook: undefined,
        instagram: undefined,
        tiktok: undefined,
        description: undefined,
        descriptionEn: undefined,
      });
      expect(res.status()).toBe(201);
    });

    test("PRT-010: 201 — Content-Type is application/json", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const { res } = await registerPartnerAndTrack(api, createdPartners);
      expect(res.headers()["content-type"]).toContain("application/json");
    });
  });
};

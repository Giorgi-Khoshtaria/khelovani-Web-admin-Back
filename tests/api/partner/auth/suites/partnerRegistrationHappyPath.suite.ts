import { test, PartnerFixtures } from "../../../../fixtures/partner.fixture.js";
import { expect } from "@playwright/test";
import {
  ENDPOINTS,
  DEFAULT_PARTNER,
  DEFAULT_INDIVIDUAL_PARTNER,
  REAL_EMAILS,
} from "../../../../constants/endpoints.js";
import { randomId, randomEmail } from "../../../../helpers/utils/generators.js";
import {
  registerPartnerAndTrack,
  registerIndividualAndTrack,
} from "../registration.helpers.js";
import { DbHelper } from "../../../../helpers/db/db.helper.js";

export const partnerRegistrationHappyPathSuites = () => {
  // ─── Organization happy path ──────────────────────────────────────
  test.describe("1. Happy Path — Organization", () => {
    test("PRT-001: 201 — org registers with a real  email, full response contract", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const email = randomEmail();

      await DbHelper.deletePartnerByEmail(email);

      const { res } = await registerPartnerAndTrack(api, createdPartners, {
        email,
      });

      expect(res.status()).toBe(201);
      expect(res.headers()["content-type"]).toContain("application/json");

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(typeof body.message).toBe("string");
      expect(body.message.length).toBeGreaterThan(5);

      const partner = body.data?.partner;
      expect(partner).toBeDefined();
      expect(typeof partner._id).toBe("string");
      expect(partner._id.length).toBeGreaterThan(0);
      expect(partner.email).toBe(email.toLowerCase());
      expect(JSON.stringify(body)).not.toMatch(/password/i);
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
      expect((await res.json()).message).toMatch(/[ა-ჿ]/);
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
      expect((await res.json()).message).toMatch(/[a-zA-Z]/);
      createdPartners.push({ email, identificationCode });
    });

    test("PRT-008: 201 — optional social fields provided", async ({
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

    test("PRT-009: 201 — optional social fields omitted", async ({
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

  // ─── Individual (physical person) happy path ──────────────────────
  test.describe("2. Happy Path — Individual (Physical Person)", () => {
    test("PRT-IND-001: 201 — individual registers with a fresh test email, full response contract", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const email = randomEmail();
      await DbHelper.deletePartnerByEmail(email);

      const { res } = await registerIndividualAndTrack(api, createdPartners, {
        email,
      });

      expect(res.status()).toBe(201);
      expect(res.headers()["content-type"]).toContain("application/json");

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(typeof body.message).toBe("string");

      const partner = body.data?.partner;
      expect(partner).toBeDefined();
      expect(typeof partner._id).toBe("string");
      expect(partner.email).toBe(email.toLowerCase());
      expect(JSON.stringify(body)).not.toMatch(/password/i);
    });

    test("PRT-IND-002: 201 — DB row has correct type, personalNumber, status and bcrypt hash", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const { res, email, personalNumber } = await registerIndividualAndTrack(
        api,
        createdPartners,
      );
      expect(res.status()).toBe(201);

      const doc = await DbHelper.getPartnerByEmail(email);
      expect(doc).not.toBeNull();
      expect(doc.partnerType).toBe("individual");
      expect(doc.personalNumber).toBe(personalNumber);
      expect(doc.identificationCode).toBeUndefined();
      expect(doc.contactPerson).toBeUndefined();
      expect(doc.status).toBe("PENDING");
      expect(doc.password).toMatch(/^\$2[aby]\$/);
    });

    test("PRT-IND-010: 201 — personalNumber with leading zeros is accepted", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const { res } = await registerIndividualAndTrack(api, createdPartners, {
        personalNumber: "00123456789",
      });
      expect(res.status()).toBe(201);
    });

    test("PRT-IND-011: 201 — individual without optional social fields succeeds", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const { res } = await registerIndividualAndTrack(api, createdPartners, {
        website: undefined,
        facebook: undefined,
        instagram: undefined,
        tiktok: undefined,
        description: undefined,
        descriptionEn: undefined,
      });
      expect(res.status()).toBe(201);
    });

    test("PRT-IND-013: 201 — lang=ge individual returns Georgian message", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const email = randomEmail();
      await DbHelper.deletePartnerByEmail(email);
      const personalNumber = randomId();

      const res = await api.post(`${ENDPOINTS.PARTNER_REGISTER}?lang=ge`, {
        data: { ...DEFAULT_INDIVIDUAL_PARTNER, email, personalNumber },
      });
      expect(res.status()).toBe(201);
      expect((await res.json()).message).toMatch(/[ა-ჿ]/);
      createdPartners.push({ email, identificationCode: "" });
    });
  });
};

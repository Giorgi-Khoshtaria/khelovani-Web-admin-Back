import { test, PartnerFixtures } from "../../../../fixtures/partner.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { randomId, randomEmail } from "../../../../helpers/utils/generators.js";
import {
  registerPartner,
  registerPartnerAndTrack,
  registerOrgWith,
  registerIndWith,
} from "../registration.helpers.js";

export const partnerRegistrationSecuritySuites = () => {
  test.describe("5. Bad Request / Protocol", () => {
    test("PRT-027: 422 — empty object body {}", async ({ api }: PartnerFixtures) => {
      const res = await api.post(ENDPOINTS.PARTNER_REGISTER, { data: {} });
      expect(res.status()).toBe(422);
    });

    test("PRT-028: 400 — malformed JSON", async ({ api }: PartnerFixtures) => {
      const res = await api.post(ENDPOINTS.PARTNER_REGISTER, {
        headers: { "Content-Type": "application/json" },
        data: '{ "email": "broken" ',
      });
      expect(res.status()).toBe(400);
    });

    test("PRT-035: 413 or 422 — huge payload never causes 500", async ({ api }: PartnerFixtures) => {
      const res = await api.post(ENDPOINTS.PARTNER_REGISTER, {
        data: { email: randomEmail(), companyNameEn: "x".repeat(1_000_000) },
      });
      expect([400, 413, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
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
      await registerPartnerAndTrack(api, createdPartners, { email: sharedEmail });
      const res = await registerPartner(api, { email: sharedEmail });
      const body = await res.json();
      expect(res.status()).toBe(409);
      expect(typeof body.message).toBe("string");
      expect(body.message.length).toBeGreaterThan(0);
    });

    test("PRT-036: 201 response has message field", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const { res } = await registerPartnerAndTrack(api, createdPartners);
      const body = await res.json();
      expect(typeof body.message).toBe("string");
      expect(body.message.length).toBeGreaterThan(0);
    });
  });

  test.describe("7. Injection & Security", () => {
    test("PRT-041: 422 — NoSQL injection in email", async ({ api }: PartnerFixtures) => {
      for (const email of ['{"$gt":""}', '{"$where":"return true"}', '{"$ne":null}']) {
        const res = await registerPartner(api, { email });
        expect(res.status()).not.toBe(500);
        expect([400, 422]).toContain(res.status());
      }
    });

    test("PRT-042: 422 — XSS in email field", async ({ api }: PartnerFixtures) => {
      const res = await registerPartner(api, { email: "<script>alert(1)</script>@test.com" });
      expect(res.status()).toBe(422);
    });

    test("PRT-043: XSS in companyNameEn — not reflected raw in response", async ({
      api,
    }: PartnerFixtures) => {
      const xss = "<img src=x onerror=alert(1)>";
      const res = await registerPartner(api, { companyNameEn: xss });
      const text = await res.text();
      expect(res.status()).not.toBe(500);
      if (res.status() !== 422) {
        expect(text).not.toContain("<img src=x onerror=alert(1)>");
      }
    });

    test("PRT-044: prototype pollution in body — no 500", async ({ api }: PartnerFixtures) => {
      const res = await api.post(ENDPOINTS.PARTNER_REGISTER, {
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({
          email: randomEmail(),
          __proto__: { isAdmin: true },
          constructor: { prototype: { isAdmin: true } },
        }),
      });
      expect(res.status()).not.toBe(500);
    });

    test("PRT-045: no stack trace or DB internals in error response", async ({
      api,
    }: PartnerFixtures) => {
      const text = await (await registerPartner(api, { email: "bad-email" })).text();
      expect(text).not.toMatch(/mongodb/i);
      expect(text).not.toMatch(/mongoose/i);
      expect(text).not.toMatch(/at Object\./);
      expect(text).not.toMatch(/\.js:\d+:\d+/);
    });

    test("PRT-046: no X-Powered-By header", async ({ api }: PartnerFixtures) => {
      expect(
        (await registerPartner(api, { email: "bad" })).headers()["x-powered-by"],
      ).toBeUndefined();
    });

    test("PRT-047: Content-Type is application/json on error responses", async ({
      api,
    }: PartnerFixtures) => {
      expect(
        (await registerPartner(api, { email: "bad" })).headers()["content-type"],
      ).toContain("application/json");
    });

    test("PRT-048: password never echoed in 201 success response", async ({
      api,
      createdPartners,
    }: PartnerFixtures) => {
      const password = "PartnerPass123!";
      const { res } = await registerPartnerAndTrack(api, createdPartners, { password });
      const text = await res.text();
      expect(text).not.toContain(password);
    });

    test("PRT-049: NoSQL injection in identificationCode — no 500", async ({
      api,
    }: PartnerFixtures) => {
      for (const identificationCode of ['{"$gt":""}', '{"$ne":null}']) {
        const res = await registerPartner(api, { identificationCode });
        expect(res.status()).not.toBe(500);
      }
    });
  });

  // ─── Malicious content (isMalicious refinement on text fields) ────
  test.describe("8. Malicious Content — isMalicious refinement", () => {
    const xssPayloads: Array<[string, string]> = [
      ["script tag", "<script>alert(1)</script>"],
      ["javascript: scheme", "javascript:alert(document.cookie)"],
      ["onerror handler", "<img src=x onerror=alert(1)>"],
      ["onload handler", "<svg onload=alert(1)>"],
      ["document.cookie access", "steal document.cookie now"],
      ["eval call", "eval(atob('YWxlcnQoMSk='))"],
    ];

    for (const [label, payload] of xssPayloads) {
      test(`PRT-050 (${label}): 422 — org description rejects ${label}`, async ({
        api,
      }: PartnerFixtures) => {
        const res = await registerOrgWith(api, { description: payload });
        expect(res.status(), label).toBe(422);
      });

      test(`PRT-051 (${label}): 422 — org descriptionEn rejects ${label}`, async ({
        api,
      }: PartnerFixtures) => {
        const res = await registerOrgWith(api, { descriptionEn: payload });
        expect(res.status(), label).toBe(422);
      });

      test(`PRT-052 (${label}): 422 — individual description rejects ${label}`, async ({
        api,
      }: PartnerFixtures) => {
        const res = await registerIndWith(api, { description: payload });
        expect(res.status(), label).toBe(422);
      });
    }

    test("PRT-055: 422 — malicious content in address field", async ({
      api,
    }: PartnerFixtures) => {
      const res = await registerOrgWith(api, {
        address: "<script>alert(1)</script>",
      });
      expect(res.status()).toBe(422);
    });

    test("PRT-056: 422 — error response names the offending field", async ({
      api,
    }: PartnerFixtures) => {
      const res = await registerOrgWith(api, {
        description: "<script>alert(1)</script>",
      });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(
        body.errors.some((e: any) => e.field === "description"),
      ).toBe(true);
    });
  });
};

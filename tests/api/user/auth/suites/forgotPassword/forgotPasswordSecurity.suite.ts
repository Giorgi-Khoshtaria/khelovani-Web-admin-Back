import { expect } from "@playwright/test";
import { test } from "../../../../../fixtures/user.fixture.js";
import { ENDPOINTS } from "../../../../../constants/endpoints.js";

const BYPASS = { "x-test-bypass": "khelovani-test-2026" };

export const forgotPasswordSecuritySuites = () => {
  test.describe("3. Security", () => {
    test("FPW-030: NoSQL injection in email — 422 or 200, never 500", async ({ request }) => {
      for (const email of ['{"$gt":""}', '{"$where":"return true"}', '{"$ne":null}']) {
        const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, {
          data: { email },
          headers: BYPASS,
        });
        expect(res.status()).not.toBe(500);
        expect([200, 400, 422]).toContain(res.status());
      }
    });

    test("FPW-031: XSS in email field — 422, not reflected in response", async ({ request }) => {
      const xss = "<script>alert(1)</script>@test.com";
      const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, {
        data: { email: xss },
        headers: BYPASS,
      });
      expect(res.status()).toBe(422);
      const text = await res.text();
      expect(text).not.toContain("<script>alert(1)</script>");
    });

    test("FPW-032: very long email — 422, never 500", async ({ request }) => {
      const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, {
        data: { email: "a".repeat(500) + "@test.com" },
        headers: BYPASS,
      });
      expect([400, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("FPW-033: extremely large body — never causes 500", async ({ request }) => {
      const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, {
        data: { email: "test@test.com", junk: "x".repeat(1_000_000) },
        headers: BYPASS,
      });
      expect([200, 400, 413, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("FPW-034: prototype pollution in body — no 500", async ({ request }) => {
      const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, {
        headers: { "Content-Type": "application/json", ...BYPASS },
        data: JSON.stringify({
          email: "test@test.com",
          __proto__: { isAdmin: true },
          constructor: { prototype: { isAdmin: true } },
        }),
      });
      expect(res.status()).not.toBe(500);
    });

    test("FPW-035: no stack trace or DB internals in error response", async ({ request }) => {
      const text = await (
        await request.post(ENDPOINTS.FORGOT_PASSWORD, {
          data: { email: "bad" },
          headers: BYPASS,
        })
      ).text();
      expect(text).not.toMatch(/mongodb/i);
      expect(text).not.toMatch(/mongoose/i);
      expect(text).not.toMatch(/at Object\./);
      expect(text).not.toMatch(/\.js:\d+:\d+/);
    });

    test("FPW-036: no X-Powered-By header", async ({ request }) => {
      const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, {
        data: { email: "bad" },
        headers: BYPASS,
      });
      expect(res.headers()["x-powered-by"]).toBeUndefined();
    });

    test("FPW-037: response Content-Type is application/json", async ({ request }) => {
      const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, {
        data: { email: "bad" },
        headers: BYPASS,
      });
      expect(res.headers()["content-type"]).toContain("application/json");
    });
  });
};

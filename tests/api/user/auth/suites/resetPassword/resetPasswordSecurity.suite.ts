import { expect } from "@playwright/test";
import { test } from "../../../../../fixtures/user.fixture.js";
import { ENDPOINTS } from "../../../../../constants/endpoints.js";

const BYPASS = { "x-test-bypass": "khelovani-test-2026" };
const VALID_PASSWORD = "NewStrongPassword123!";
const DUMMY_TOKEN = "dummy_token";

export const resetPasswordSecuritySuites = () => {
  test.describe("3. Security", () => {
    test("RST-040: NoSQL injection in token field — no 500", async ({ request }) => {
      for (const token of ['{"$gt":""}', '{"$where":"return true"}', '{"$ne":null}']) {
        const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
          data: { token, password: VALID_PASSWORD },
          headers: BYPASS,
        });
        expect(res.status()).not.toBe(500);
        expect([400, 401, 422]).toContain(res.status());
      }
    });

    test("RST-041: XSS in password field — rejected or stored safely", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: { token: DUMMY_TOKEN, password: "<script>alert(1)</script>A1!" },
        headers: BYPASS,
      });
      expect(res.status()).not.toBe(500);
      const text = await res.text();
      expect(text).not.toContain("<script>alert(1)</script>");
    });

    test("RST-042: very long token (10 000 chars) — no 500", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: { token: "a".repeat(10_000), password: VALID_PASSWORD },
        headers: BYPASS,
      });
      expect([400, 401, 413, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("RST-043: huge payload — no 500", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: { token: DUMMY_TOKEN, password: VALID_PASSWORD, junk: "x".repeat(1_000_000) },
        headers: BYPASS,
      });
      expect([400, 413, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("RST-044: no stack trace or DB internals in error response", async ({ request }) => {
      const text = await (
        await request.post(ENDPOINTS.RESET_PASSWORD, {
          data: { token: "bad_token", password: VALID_PASSWORD },
          headers: BYPASS,
        })
      ).text();
      expect(text).not.toMatch(/mongodb/i);
      expect(text).not.toMatch(/mongoose/i);
      expect(text).not.toMatch(/at Object\./);
      expect(text).not.toMatch(/\.js:\d+:\d+/);
    });

    test("RST-045: no X-Powered-By header", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: {},
        headers: BYPASS,
      });
      expect(res.headers()["x-powered-by"]).toBeUndefined();
    });

    test("RST-046: response Content-Type is application/json", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: {},
        headers: BYPASS,
      });
      expect(res.headers()["content-type"]).toContain("application/json");
    });

    test("RST-047: prototype pollution in body — no 500", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        headers: { "Content-Type": "application/json", ...BYPASS },
        data: JSON.stringify({
          token: DUMMY_TOKEN,
          password: VALID_PASSWORD,
          __proto__: { isAdmin: true },
        }),
      });
      expect(res.status()).not.toBe(500);
    });
  });
};

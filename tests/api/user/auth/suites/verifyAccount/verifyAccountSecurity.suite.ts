import { expect } from "@playwright/test";
import { test } from "../../../../../fixtures/user.fixture.js";
import { ENDPOINTS } from "../../../../../constants/endpoints.js";

export const verifyAccountSecuritySuites = () => {
  test.describe("3. Security", () => {
    test("VER-020: no X-Powered-By header", async ({ request }) => {
      const res = await request.get(ENDPOINTS.VERIFY);
      expect(res.headers()["x-powered-by"]).toBeUndefined();
    });

    test("VER-021: response Content-Type is application/json", async ({ request }) => {
      const res = await request.get(`${ENDPOINTS.VERIFY}?token=bad`);
      expect(res.headers()["content-type"]).toContain("application/json");
    });

    test("VER-022: no stack trace or DB internals in error response", async ({ request }) => {
      const text = await (
        await request.get(`${ENDPOINTS.VERIFY}?token=invalid_token`)
      ).text();
      expect(text).not.toMatch(/mongodb/i);
      expect(text).not.toMatch(/mongoose/i);
      expect(text).not.toMatch(/at Object\./);
      expect(text).not.toMatch(/\.js:\d+:\d+/);
    });

    test("VER-023: XSS in token param — 400, not reflected in response", async ({ request }) => {
      const xss = encodeURIComponent("<script>alert(1)</script>");
      const res = await request.get(`${ENDPOINTS.VERIFY}?token=${xss}`);
      expect([400, 401]).toContain(res.status());
      const text = await res.text();
      expect(text).not.toContain("<script>alert(1)</script>");
    });

    test("VER-024: very long token — 400, never 500", async ({ request }) => {
      const res = await request.get(`${ENDPOINTS.VERIFY}?token=${"a".repeat(5_000)}`);
      expect([400, 401, 414]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });
  });
};

import { test } from "../../../../fixtures/user.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";

export const publicMenuSecuritySuites = () => {
  test.describe("2. Security & Public Access — Public Menu", () => {
    // ─── Access Control ───────────────────────────────────────────
    test("PMN-070: 200 — accessible without authentication", async ({
      api,
    }) => {
      expect((await api.get(ENDPOINTS.PUBLIC_MENU)).status()).toBe(200);
    });

    test("PMN-071: 200 — accessible even with arbitrary token (public endpoint)", async ({
      api,
    }) => {
      const res = await api.get(ENDPOINTS.PUBLIC_MENU, {
        headers: { Authorization: "Bearer some_dummy_token" },
      });
      expect(res.status()).toBe(200);
    });

    test("PMN-072: 200 — ignores unexpected query parameters (no 500)", async ({
      api,
    }) => {
      const res = await api.get(ENDPOINTS.PUBLIC_MENU, {
        params: { unknown: "parameter", injection: '{"$gt":""}' },
      });
      expect(res.status()).toBe(200);
    });

    test("PMN-073: 404 or 405 — POST /api/menu not supported", async ({
      api,
    }) => {
      const res = await api.post(ENDPOINTS.PUBLIC_MENU, { data: {} });
      expect([404, 405]).toContain(res.status());
    });

    // ─── Security ─────────────────────────────────────────────────
    test("PMN-075: NoSQL injection in query params — no 500", async ({
      api,
    }) => {
      for (const [key, val] of [
        ["search", '{"$gt":""}'],
        ["filter", '{"$where":"return true"}'],
        ["id", '{"$ne":null}'],
      ] as [string, string][]) {
        const res = await api.get(ENDPOINTS.PUBLIC_MENU, { params: { [key]: val } });
        expect(res.status()).not.toBe(500);
        expect(res.status()).toBe(200);
      }
    });

    test("PMN-076: XSS in query param — response text does not echo raw script tag", async ({
      api,
    }) => {
      const res = await api.get(ENDPOINTS.PUBLIC_MENU, {
        params: { q: "<script>alert(1)</script>" },
      });
      const text = await res.text();
      expect(res.status()).toBe(200);
      expect(text).not.toContain("<script>alert(1)</script>");
    });

    test("PMN-077: no X-Powered-By header in response", async ({ api }) => {
      expect(
        (await api.get(ENDPOINTS.PUBLIC_MENU)).headers()["x-powered-by"],
      ).toBeUndefined();
    });

    test("PMN-078: no stack trace or DB internals in any response", async ({
      api,
    }) => {
      const text = await (await api.get(ENDPOINTS.PUBLIC_MENU)).text();
      expect(text).not.toMatch(/mongodb/i);
      expect(text).not.toMatch(/mongoose/i);
      expect(text).not.toMatch(/at Object\./);
      expect(text).not.toMatch(/\.js:\d+:\d+/);
    });

    test("PMN-079: Content-Type is application/json", async ({ api }) => {
      expect(
        (await api.get(ENDPOINTS.PUBLIC_MENU)).headers()["content-type"],
      ).toContain("application/json");
    });

    test("PMN-080: DELETE method returns 404 or 405 (not 500)", async ({
      api,
    }) => {
      const res = await api.delete(ENDPOINTS.PUBLIC_MENU);
      expect([404, 405]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("PMN-081: extremely long query string — no 500", async ({ api }) => {
      const res = await api.get(ENDPOINTS.PUBLIC_MENU, {
        params: { q: "a".repeat(5000) },
      });
      expect(res.status()).not.toBe(500);
    });

    test("PMN-082: Unicode and null bytes in query — no 500", async ({
      api,
    }) => {
      const res = await api.get(ENDPOINTS.PUBLIC_MENU, {
        params: { q: "\u0000\u202e\uFEFF" },
      });
      expect(res.status()).not.toBe(500);
    });
  });
};

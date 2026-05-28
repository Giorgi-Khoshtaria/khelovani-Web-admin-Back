import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";

export const clearCacheSuites = () => {
  test.describe("1. Clear Cache — Happy Path", () => {
    test("CACHE-001: 200 — admin flushes all cache domains", async ({
      adminApi,
    }) => {
      const res = await adminApi.delete(ENDPOINTS.ADMIN_CACHE);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.message).toMatch(/cache/i);
    });

    test("CACHE-002: 200 — clearing cache is idempotent", async ({
      adminApi,
    }) => {
      const first = await adminApi.delete(ENDPOINTS.ADMIN_CACHE);
      const second = await adminApi.delete(ENDPOINTS.ADMIN_CACHE);
      expect(first.status()).toBe(200);
      expect(second.status()).toBe(200);
    });
  });

  test.describe("2. Clear Cache — Security", () => {
    test("CACHE-SEC-001: 401 — no token", async ({ request }) => {
      const res = await request.delete(ENDPOINTS.ADMIN_CACHE);
      expect(res.status()).toBe(401);
    });

    test("CACHE-SEC-002: 401 — malformed token", async ({ request }) => {
      const res = await request.delete(ENDPOINTS.ADMIN_CACHE, {
        headers: { Authorization: "Bearer garbage.token.here" },
      });
      expect(res.status()).toBe(401);
    });

    test("CACHE-SEC-003: 403 — partner lacks settings.edit permission", async ({
      partnerApi,
    }) => {
      const res = await partnerApi.delete(ENDPOINTS.ADMIN_CACHE);
      expect(res.status()).toBe(403);
    });

    test("CACHE-SEC-004: 404/405 — cache endpoint only supports DELETE", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_CACHE);
      expect([404, 405]).toContain(res.status());
    });
  });
};

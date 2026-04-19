import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createTestProduct, cleanupProduct } from "../products.helpers.js";

export const deleteProductSuites = () => {
  test.describe("5. Delete Product (DELETE /api/products/:productId)", () => {
    const partnerId = process.env.ORGANIZER_PARTNER_ID!;

    // ─── Happy Path ───────────────────────────────────────────────
    test("PR-050: Admin can delete a product", async ({ adminApi }) => {
      const product = await createTestProduct(adminApi, partnerId);
      const res = await adminApi.delete(`${ENDPOINTS.ADMIN_PRODUCTS}/${product._id}`);
      expect(res.status()).toBe(200);

      const checkRes = await adminApi.get(`${ENDPOINTS.ADMIN_PRODUCTS}/${product._id}`);
      expect(checkRes.status()).toBe(404);
    });

    test("PR-051: Partner can delete their own product", async ({ partnerApi, partnerUser }) => {
      const myProduct = await createTestProduct(partnerApi, partnerUser.id!);
      const res = await partnerApi.delete(`${ENDPOINTS.ADMIN_PRODUCTS}/${myProduct._id}`);
      expect(res.status()).toBe(200);
    });

    test("PR-055: 200 — response confirms deletion with message or data", async ({ adminApi }) => {
      const product = await createTestProduct(adminApi, partnerId);
      const body = await (
        await adminApi.delete(`${ENDPOINTS.ADMIN_PRODUCTS}/${product._id}`)
      ).json();
      const hasMsg = typeof body.message === "string";
      const hasId = body.data?._id === product._id || body._id === product._id;
      expect(hasMsg || hasId).toBe(true);
    });

    test("PR-056: 200 — concurrent deletes — no 500, one wins", async ({ adminApi }) => {
      const product = await createTestProduct(adminApi, partnerId);
      const [r1, r2] = await Promise.all([
        adminApi.delete(`${ENDPOINTS.ADMIN_PRODUCTS}/${product._id}`),
        adminApi.delete(`${ENDPOINTS.ADMIN_PRODUCTS}/${product._id}`),
      ]);
      expect(r1.status()).not.toBe(500);
      expect(r2.status()).not.toBe(500);
      expect([200, 404]).toContain(r1.status());
      expect([200, 404]).toContain(r2.status());
    });

    // ─── Validation ───────────────────────────────────────────────
    test("PR-052: 404 — Delete non-existent product", async ({ adminApi }) => {
      const res = await adminApi.delete(`${ENDPOINTS.ADMIN_PRODUCTS}/67f123456789012345678901`);
      expect(res.status()).toBe(404);
    });

    test("PR-053: 422 — Invalid product ID format on delete", async ({ adminApi }) => {
      const res = await adminApi.delete(`${ENDPOINTS.ADMIN_PRODUCTS}/invalid-id`);
      expect(res.status()).toBe(422);
    });

    test("PR-057: 404 — delete already deleted product", async ({ adminApi }) => {
      const product = await createTestProduct(adminApi, partnerId);
      await adminApi.delete(`${ENDPOINTS.ADMIN_PRODUCTS}/${product._id}`);
      const res = await adminApi.delete(`${ENDPOINTS.ADMIN_PRODUCTS}/${product._id}`);
      expect(res.status()).toBe(404);
    });

    // ─── Authorization ────────────────────────────────────────────
    test("PR-060: 401 — no token returns 401", async ({ api, adminApi }) => {
      const product = await createTestProduct(adminApi, partnerId);
      try {
        expect((await api.delete(`${ENDPOINTS.ADMIN_PRODUCTS}/${product._id}`)).status()).toBe(401);
      } finally {
        await cleanupProduct(adminApi, product._id);
      }
    });

    test("PR-061: 403 — partner cannot delete another partner's product", async ({
      partnerApi,
      partnerUser,
      adminApi,
    }) => {
      const product = await createTestProduct(adminApi, partnerId);
      try {
        const res = await partnerApi.delete(`${ENDPOINTS.ADMIN_PRODUCTS}/${product._id}`);
        expect(res.status()).toBe(403);
      } finally {
        await cleanupProduct(adminApi, product._id);
      }
    });

    test("PR-062: 401 — expired JWT returns 401", async ({ api, adminApi }) => {
      const product = await createTestProduct(adminApi, partnerId);
      const expired =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
        ".eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9" +
        ".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      try {
        const res = await api.delete(`${ENDPOINTS.ADMIN_PRODUCTS}/${product._id}`, {
          headers: { Authorization: `Bearer ${expired}` },
        });
        expect(res.status()).toBe(401);
      } finally {
        await cleanupProduct(adminApi, product._id);
      }
    });

    // ─── Security ─────────────────────────────────────────────────
    test("PR-065: path traversal in id — 422 or 404, never 500", async ({ adminApi }) => {
      const res = await adminApi.delete(`${ENDPOINTS.ADMIN_PRODUCTS}/../../etc/passwd`);
      expect([422, 404]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("PR-066: no stack trace or DB internals in error response", async ({ adminApi }) => {
      const text = await (
        await adminApi.delete(`${ENDPOINTS.ADMIN_PRODUCTS}/000000000000000000000000`)
      ).text();
      expect(text).not.toMatch(/mongodb/i);
      expect(text).not.toMatch(/mongoose/i);
      expect(text).not.toMatch(/at Object\./);
      expect(text).not.toMatch(/\.js:\d+:\d+/);
    });

    test("PR-067: no X-Powered-By header", async ({ adminApi }) => {
      expect(
        (await adminApi.delete(`${ENDPOINTS.ADMIN_PRODUCTS}/000000000000000000000000`))
          .headers()["x-powered-by"],
      ).toBeUndefined();
    });
  });
};

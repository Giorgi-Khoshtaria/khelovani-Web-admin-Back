import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import {
  createCategory,
  deleteCategory,
  uniqueSlug,
  uniqueNameGe,
  uniqueNameEn,
} from "../categories.helpers.js";

export const categoriesSecuritySuites = () => {
  test.describe("6. Authorization & Security", () => {
    test("CAT-080: 401 — no token: GET list", async ({ api }) => {
      expect((await api.get(ENDPOINTS.ADMIN_CATEGORIES)).status()).toBe(401);
    });

    test("CAT-081: 401 — no token: POST create", async ({ api }) => {
      const res = await api.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { slug: uniqueSlug(), nameGe: uniqueNameGe(), nameEn: uniqueNameEn() },
      });
      expect(res.status()).toBe(401);
    });

    test("CAT-082: 401 — no token: PUT update", async ({ api, adminApi }) => {
      const { id } = await createCategory(adminApi);
      try {
        const res = await api.put(`${ENDPOINTS.ADMIN_CATEGORIES}/${id}`, {
          data: { nameEn: uniqueNameEn() },
        });
        expect(res.status()).toBe(401);
      } finally {
        await deleteCategory(adminApi, id);
      }
    });

    test("CAT-083: 401 — no token: DELETE", async ({ api, adminApi }) => {
      const { id } = await createCategory(adminApi);
      try {
        const res = await api.delete(`${ENDPOINTS.ADMIN_CATEGORIES}/${id}`);
        expect(res.status()).toBe(401);
      } finally {
        await deleteCategory(adminApi, id);
      }
    });

    test("CAT-084: 403 — partner role: GET list", async ({ partnerApi }) => {
      expect((await partnerApi.get(ENDPOINTS.ADMIN_CATEGORIES)).status()).toBe(403);
    });

    test("CAT-085: 403 — partner role: POST create", async ({ partnerApi }) => {
      const res = await partnerApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { slug: uniqueSlug(), nameGe: uniqueNameGe(), nameEn: uniqueNameEn() },
      });
      expect(res.status()).toBe(403);
    });

    test("CAT-086: 401 — expired JWT", async ({ api }) => {
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
        ".eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9" +
        ".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const res = await api.get(ENDPOINTS.ADMIN_CATEGORIES, {
        headers: { Authorization: `Bearer ${expiredToken}` },
      });
      expect(res.status()).toBe(401);
    });

    test("CAT-087: no X-Powered-By header", async ({ adminApi }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_CATEGORIES);
      expect(res.headers()["x-powered-by"]).toBeUndefined();
    });

    test("CAT-088: 422 — XSS in slug is rejected by regex", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { slug: "<script>alert(1)</script>", nameGe: uniqueNameGe(), nameEn: uniqueNameEn() },
      });
      expect(res.status()).toBe(422);
    });

    test("CAT-089: 422 or 413 — huge payload never causes 500", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { slug: uniqueSlug(), nameGe: "ტ".repeat(100_000), nameEn: uniqueNameEn() },
      });
      expect([413, 422]).toContain(res.status());
    });

    test("CAT-090: no stack trace in error responses", async ({ adminApi }) => {
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_CATEGORIES}/000000000000000000000000`);
      const text = await res.text();
      expect(text).not.toMatch(/mongodb/i);
      expect(text).not.toMatch(/mongoose/i);
      expect(text).not.toMatch(/at Object\./);
    });

    test("CAT-091: 422 errors have JSON array errors field", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, { data: {} });
      const body = await res.json().catch(() => null);
      expect(body).not.toBeNull();
      expect(Array.isArray(body.errors)).toBe(true);
    });
  });
};

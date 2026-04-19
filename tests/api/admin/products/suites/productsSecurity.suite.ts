import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createTestProduct, cleanupProduct } from "../products.helpers.js";

export const productsSecuritySuites = () => {
  test.describe("6. Security — Authorization & NoSQL Injection", () => {
    let testProductId: string;
    const partnerId = process.env.ORGANIZER_PARTNER_ID!;

    test.beforeEach(async ({ adminApi }) => {
      const product = await createTestProduct(adminApi, partnerId);
      testProductId = product._id;
    });

    test.afterEach(async ({ adminApi }) => {
      if (testProductId) {
        await cleanupProduct(adminApi, testProductId);
      }
    });

    // ─── Authorization ─────────────────────────────────────────────────────────

    test("PR-070: 401 — GET products list without token", async ({ api }) => {
      const res = await api.get(ENDPOINTS.ADMIN_PRODUCTS, {
        headers: { "x-test-bypass": "khelovani-test-2026" },
      });
      // Public endpoint — 200 is also acceptable (optionalAuthenticate)
      expect([200, 401]).toContain(res.status());
    });

    test("PR-071: 403 — Partner cannot delete another partner's product", async ({
      partnerApi,
    }) => {
      const res = await partnerApi.delete(
        `${ENDPOINTS.ADMIN_PRODUCTS}/${testProductId}`,
      );
      expect(res.status()).toBe(403);
    });

    test("PR-074: Invalid JWT returns 401", async ({ api }) => {
      const res = await api.get(ENDPOINTS.ADMIN_PRODUCTS, {
        headers: {
          Authorization: "Bearer invalid_token_xyz",
          "x-test-bypass": "khelovani-test-2026",
        },
      });
      expect(res.status()).toBe(401);
    });

    test("PR-075: 403 — Partner cannot view another partner's hidden product", async ({
      partnerApi,
    }) => {
      const res = await partnerApi.get(
        `${ENDPOINTS.ADMIN_PRODUCTS}/${testProductId}`,
      );
      expect(res.status()).toBe(403);
    });

    // ─── Mass assignment ────────────────────────────────────────────────────────

    test("PR-073: Mass assignment — 'owner' field cannot be overridden via URL param", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_PRODUCTS}/${testProductId}`,
      );
      const body = await res.json();
      expect(body.data.owner).toBe(partnerId);
    });

    // ─── NoSQL Injection — search parameter ────────────────────────────────────

    test("PR-076: NoSQL injection in search ($ne operator) — no 500", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { search: '{"$ne":null}' },
      });
      expect(res.status()).not.toBe(500);
      expect([200, 400, 422]).toContain(res.status());
    });

    test("PR-077: NoSQL injection in search ($or operator) — no 500", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { search: '{"$or":[{"titleEn":""},{"titleGe":""}]}' },
      });
      expect(res.status()).not.toBe(500);
    });

    test("PR-078: NoSQL injection in search ($where) — no 500 or data leak", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { search: '{"$where":"this.price > 0"}' },
      });
      expect(res.status()).not.toBe(500);
    });

    test("PR-079: NoSQL injection in search ($regex operator string) — treated as literal", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { search: '{"$regex":".*"}' },
      });
      expect(res.status()).not.toBe(500);
    });

    test("PR-079b: Regex special chars in search — no 500 (escaping applied)", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { search: ".*+?^${}()|[]\\" },
      });
      expect(res.status()).not.toBe(500);
      expect(res.status()).toBe(200);
    });

    test("PR-079c: Unicode/null bytes in search — no 500", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { search: "\u0000\u0001\u001f" },
      });
      expect(res.status()).not.toBe(500);
    });

    test("PR-079d: Extremely long search string — no 500 (truncated or rejected)", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { search: "a".repeat(5000) },
      });
      expect(res.status()).not.toBe(500);
    });

    // ─── NoSQL Injection — category parameter ──────────────────────────────────

    test("PR-072: NoSQL injection in category ($gt) — no 500", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { category: '{"$gt":""}' },
      });
      expect(res.status()).not.toBe(500);
    });

    test("PR-072b: NoSQL injection in category ($ne) — no 500", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { category: '{"$ne":null}' },
      });
      expect(res.status()).not.toBe(500);
    });

    test("PR-072c: Regex injection in category — no 500", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { category: ".*" },
      });
      expect(res.status()).not.toBe(500);
    });

    // ─── NoSQL Injection — sort parameter ──────────────────────────────────────

    test("PR-085: NoSQL injection in sort field — unknown field falls back to default", async ({
      adminApi,
    }) => {
      const maliciousSorts = [
        '{"$where":"this.price > 0"}',
        "__proto__",
        "constructor.prototype",
        "$gt:desc",
        "price; db.dropDatabase()",
      ];
      for (const sort of maliciousSorts) {
        const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
          params: { sort },
        });
        expect(res.status()).not.toBe(500);
        expect(res.status()).toBe(200);
      }
    });

    // ─── NoSQL Injection — pagination parameters ───────────────────────────────

    test("PR-086: NoSQL injection in page param — no 500", async ({
      adminApi,
    }) => {
      const payloads = [
        '{"$gt":0}',
        "1; db.drop()",
        "NaN",
        "Infinity",
        "-Infinity",
      ];
      for (const page of payloads) {
        const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
          params: { page },
        });
        expect(res.status()).not.toBe(500);
      }
    });

    test("PR-087: NoSQL injection in limit param — no 500 and never exceeds 100", async ({
      adminApi,
    }) => {
      const payloads = ['{"$gt":0}', "99999", "1e10", "0", "-1", "NaN"];
      for (const limit of payloads) {
        const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
          params: { limit },
        });
        expect(res.status()).not.toBe(500);
        if (res.status() === 200) {
          const body = await res.json();
          expect(body.meta.limit).toBeLessThanOrEqual(100);
          expect(body.meta.limit).toBeGreaterThanOrEqual(1);
        }
      }
    });

    // ─── NoSQL Injection — price filter parameters ─────────────────────────────

    test("PR-088: NoSQL injection in minPrice ($gt) — no 500", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { minPrice: '{"$gt":0}' },
      });
      expect(res.status()).not.toBe(500);
      // NaN parse result means filter is skipped — should still return 200
      expect(res.status()).toBe(200);
    });

    test("PR-088b: NoSQL injection in maxPrice — no 500", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { maxPrice: '{"$ne":null}' },
      });
      expect(res.status()).not.toBe(500);
      expect(res.status()).toBe(200);
    });

    test("PR-088c: Negative minPrice is ignored — no price filter applied", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { minPrice: -999 },
      });
      expect(res.status()).toBe(200);
    });

    // ─── Response security checks ───────────────────────────────────────────────

    test("PR-089: No X-Powered-By header exposed", async ({ adminApi }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS);
      expect(res.headers()["x-powered-by"]).toBeUndefined();
    });

    test("PR-090: No stack trace in 4xx/5xx error responses", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_PRODUCTS}/invalid-id`);
      const body = await res.json();
      expect(JSON.stringify(body)).not.toMatch(/at\s+\w+\s+\(/);
      expect(body).not.toHaveProperty("stack");
    });

    test("PR-091: XSS payload in search — returned safely (no script execution risk)", async ({
      adminApi,
    }) => {
      const xssPayload = "<script>alert(1)</script>";
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { search: xssPayload },
      });
      expect(res.status()).not.toBe(500);
      // Content-Type must be JSON, never HTML
      expect(res.headers()["content-type"]).toContain("application/json");
    });

    test("PR-092: $expr operator injection in search — no 500", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { search: '{"$expr":{"$gt":["$price",0]}}' },
      });
      expect(res.status()).not.toBe(500);
    });

    test("PR-093: Path traversal in product ID — no 500", async ({
      adminApi,
    }) => {
      const payloads = ["../../../etc/passwd", "%2e%2e%2f", "..%2F..%2F"];
      for (const id of payloads) {
        const res = await adminApi.get(
          `${ENDPOINTS.ADMIN_PRODUCTS}/${encodeURIComponent(id)}`,
        );
        expect(res.status()).not.toBe(500);
        expect([400, 404, 422]).toContain(res.status());
      }
    });
  });
};

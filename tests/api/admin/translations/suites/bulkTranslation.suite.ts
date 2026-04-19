import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { VALID_TRANSLATION } from "../translations.helpers.js";

export const bulkTranslationSuites = () => {
  test.describe("3. POST /api/admin/translations/bulk — Bulk Ops", () => {
    // ─── Happy Path ───────────────────────────────────────────────
    test("TRN-010: 200 — valid bulk translation upsert", async ({ adminApi }) => {
      const keys = [`bulk_${Date.now()}_1`, `bulk_${Date.now()}_2`];
      const items = keys.map((key) => ({
        namespace: VALID_TRANSLATION.namespace,
        key,
        ge: "ტესტი",
        en: "Test",
      }));
      const res = await adminApi.post(`${ENDPOINTS.ADMIN_TRANSLATION}/bulk`, {
        data: { items },
      });
      expect([200, 201]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("TRN-011: 200 — bulk with single item", async ({ adminApi }) => {
      const res = await adminApi.post(`${ENDPOINTS.ADMIN_TRANSLATION}/bulk`, {
        data: {
          items: [{ namespace: VALID_TRANSLATION.namespace, key: `single_${Date.now()}`, ge: "ერთი", en: "One" }],
        },
      });
      expect([200, 201]).toContain(res.status());
    });

    test("TRN-012: 200 or 207 — partial success response shape has message", async ({ adminApi }) => {
      const res = await adminApi.post(`${ENDPOINTS.ADMIN_TRANSLATION}/bulk`, {
        data: {
          items: [{ namespace: VALID_TRANSLATION.namespace, key: `shape_${Date.now()}`, ge: "ა", en: "a" }],
        },
      });
      const body = await res.json();
      expect(body).toHaveProperty("message");
    });

    // ─── Validation ───────────────────────────────────────────────
    test("TRN-015: 422 — empty items array", async ({ adminApi }) => {
      const res = await adminApi.post(`${ENDPOINTS.ADMIN_TRANSLATION}/bulk`, {
        data: { items: [] },
      });
      expect([400, 422]).toContain(res.status());
    });

    test("TRN-016: 422 — missing items field", async ({ adminApi }) => {
      const res = await adminApi.post(`${ENDPOINTS.ADMIN_TRANSLATION}/bulk`, { data: {} });
      expect([400, 422]).toContain(res.status());
    });

    test("TRN-017: 422 — item missing required key field", async ({ adminApi }) => {
      const res = await adminApi.post(`${ENDPOINTS.ADMIN_TRANSLATION}/bulk`, {
        data: { items: [{ namespace: VALID_TRANSLATION.namespace, ge: "ა", en: "a" }] },
      });
      expect([400, 422]).toContain(res.status());
    });

    test("TRN-018: 422 — item missing required namespace field", async ({ adminApi }) => {
      const res = await adminApi.post(`${ENDPOINTS.ADMIN_TRANSLATION}/bulk`, {
        data: { items: [{ key: `k_${Date.now()}`, ge: "ა", en: "a" }] },
      });
      expect([400, 422]).toContain(res.status());
    });

    // ─── Authorization ────────────────────────────────────────────
    test("TRN-020: 401 — no token", async ({ api }) => {
      const res = await api.post(`${ENDPOINTS.ADMIN_TRANSLATION}/bulk`, {
        data: {
          items: [{ namespace: VALID_TRANSLATION.namespace, key: "k", ge: "ა", en: "a" }],
        },
      });
      expect(res.status()).toBe(401);
    });

    test("TRN-021: 403 — partner role cannot bulk upsert", async ({ partnerApi }) => {
      const res = await partnerApi.post(`${ENDPOINTS.ADMIN_TRANSLATION}/bulk`, {
        data: {
          items: [{ namespace: VALID_TRANSLATION.namespace, key: "k", ge: "ა", en: "a" }],
        },
      });
      expect(res.status()).toBe(403);
    });

    // ─── Security ─────────────────────────────────────────────────
    test("TRN-025: NoSQL injection in key field — no 500", async ({ adminApi }) => {
      const injections = ['{"$gt":""}', '{"$where":"return true"}'];
      for (const key of injections) {
        const res = await adminApi.post(`${ENDPOINTS.ADMIN_TRANSLATION}/bulk`, {
          data: {
            items: [{ namespace: VALID_TRANSLATION.namespace, key, ge: "ა", en: "a" }],
          },
        });
        expect(res.status()).not.toBe(500);
      }
    });

    test("TRN-026: 413 or 422 — extremely large bulk payload never causes 500", async ({ adminApi }) => {
      const items = Array.from({ length: 10_000 }, (_, i) => ({
        namespace: VALID_TRANSLATION.namespace,
        key: `bulk_flood_${i}`,
        ge: "ა",
        en: "a",
      }));
      const res = await adminApi.post(`${ENDPOINTS.ADMIN_TRANSLATION}/bulk`, { data: { items } });
      expect([200, 201, 400, 413, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("TRN-027: no stack trace or DB internals in error response", async ({ adminApi }) => {
      const res = await adminApi.post(`${ENDPOINTS.ADMIN_TRANSLATION}/bulk`, { data: {} });
      const text = await res.text();
      expect(text).not.toMatch(/mongodb/i);
      expect(text).not.toMatch(/mongoose/i);
      expect(text).not.toMatch(/at Object\./);
      expect(text).not.toMatch(/\.js:\d+:\d+/);
    });

    test("TRN-028: no X-Powered-By header", async ({ adminApi }) => {
      const res = await adminApi.post(`${ENDPOINTS.ADMIN_TRANSLATION}/bulk`, { data: { items: [] } });
      expect(res.headers()["x-powered-by"]).toBeUndefined();
    });

    test("TRN-029: XSS in translation value — stored safely or rejected", async ({ adminApi }) => {
      const res = await adminApi.post(`${ENDPOINTS.ADMIN_TRANSLATION}/bulk`, {
        data: {
          items: [{
            namespace: VALID_TRANSLATION.namespace,
            key: `xss_${Date.now()}`,
            ge: "<script>alert(1)</script>",
            en: "ok",
          }],
        },
      });
      if ([200, 201].includes(res.status())) {
        const text = await res.text();
        expect(text).not.toContain("<script>alert(1)</script>");
      } else {
        expect([400, 422]).toContain(res.status());
      }
    });
  });
};

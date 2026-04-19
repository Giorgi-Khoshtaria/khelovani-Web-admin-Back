import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createPendingPartner } from "../partners.helpers.js";

export const bulkDeletePartnersSuites = () => {
  test.describe("POST /api/admin/partners/bulk-delete — Bulk Delete Partners", () => {
    // ─── Happy Path ───────────────────────────────────────────────
    test("BD-001: 200 — successfully deletes multiple partners", async ({ adminApi, api }) => {
      const p1 = await createPendingPartner(api);
      const p2 = await createPendingPartner(api);

      const res = await adminApi.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", {
        data: { ids: [p1.id, p2.id] },
      });

      expect(res.status()).toBe(200);

      const check1 = await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${p1.id}`);
      expect(check1.status()).toBe(404);
      const check2 = await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${p2.id}`);
      expect(check2.status()).toBe(404);
    });

    test("BD-005: 200 — deleting single partner in ids array", async ({ adminApi, api }) => {
      const p = await createPendingPartner(api);
      const res = await adminApi.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", {
        data: { ids: [p.id] },
      });
      expect(res.status()).toBe(200);
      expect((await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${p.id}`)).status()).toBe(404);
    });

    test("BD-006: 200 — idempotent: bulk-delete already deleted ids returns 200 or 404 not 500", async ({ adminApi, api }) => {
      const p = await createPendingPartner(api);
      await adminApi.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", { data: { ids: [p.id] } });
      const res = await adminApi.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", { data: { ids: [p.id] } });
      expect([200, 404]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    // ─── Validation ───────────────────────────────────────────────
    test("BD-002: 422 — empty ids array", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", {
        data: { ids: [] },
      });
      expect(res.status()).toBe(422);
    });

    test("BD-010: 422 — missing ids field entirely", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", { data: {} });
      expect(res.status()).toBe(422);
    });

    test("BD-011: 422 — ids is not an array (string)", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", {
        data: { ids: "000000000000000000000000" },
      });
      expect([400, 422]).toContain(res.status());
    });

    test("BD-012: 422 — ids contains malformed ObjectId", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", {
        data: { ids: ["not-a-valid-id"] },
      });
      expect(res.status()).toBe(422);
    });

    test("BD-013: 200 or 404 — ids contains only non-existent valid ObjectIds", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", {
        data: { ids: ["000000000000000000000000"] },
      });
      expect([200, 404]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    // ─── Authorization ────────────────────────────────────────────
    test("BD-003: 401 — no token", async ({ api }) => {
      const res = await api.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", {
        data: { ids: ["000000000000000000000000"] },
      });
      expect(res.status()).toBe(401);
    });

    test("BD-004: 403 — partner role cannot bulk delete", async ({ partnerApi }) => {
      const res = await partnerApi.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", {
        data: { ids: ["000000000000000000000000"] },
      });
      expect(res.status()).toBe(403);
    });

    test("BD-020: 401 — expired JWT", async ({ api }) => {
      const expired =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
        ".eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9" +
        ".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const res = await api.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", {
        data: { ids: ["000000000000000000000000"] },
        headers: { Authorization: `Bearer ${expired}` },
      });
      expect(res.status()).toBe(401);
    });

    // ─── Security ─────────────────────────────────────────────────
    test("BD-030: NoSQL injection in ids array — 422, never 500", async ({ adminApi }) => {
      const injections = [
        ['{"$gt":""}'],
        ['{"$where":"return true"}'],
        [{ $ne: null } as any],
      ];
      for (const ids of injections) {
        const res = await adminApi.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", {
          data: { ids },
        });
        expect(res.status()).not.toBe(500);
        expect([400, 422]).toContain(res.status());
      }
    });

    test("BD-031: prototype pollution in body — no 500", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", {
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({
          ids: ["000000000000000000000000"],
          __proto__: { isAdmin: true },
          constructor: { prototype: { isAdmin: true } },
        }),
      });
      expect(res.status()).not.toBe(500);
    });

    test("BD-032: 413 or 422 — extremely large ids array never causes 500", async ({ adminApi }) => {
      const ids = Array.from({ length: 10_000 }, () => "000000000000000000000000");
      const res = await adminApi.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", {
        data: { ids },
      });
      expect([200, 400, 413, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("BD-033: no stack trace or DB internals in error response", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", {
        data: { ids: ["not-valid"] },
      });
      const text = await res.text();
      expect(text).not.toMatch(/mongodb/i);
      expect(text).not.toMatch(/mongoose/i);
      expect(text).not.toMatch(/at Object\./);
      expect(text).not.toMatch(/\.js:\d+:\d+/);
    });

    test("BD-034: response Content-Type is application/json", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", {
        data: { ids: [] },
      });
      expect(res.headers()["content-type"]).toContain("application/json");
    });

    test("BD-035: no X-Powered-By header", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", {
        data: { ids: ["000000000000000000000000"] },
      });
      expect(res.headers()["x-powered-by"]).toBeUndefined();
    });
  });
};

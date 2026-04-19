import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createPermission, deletePermission } from "../permissions.helpers.js";

export const deletePermissionSuites = () => {
  test.describe("5. DELETE /api/admin/permissions/:id — Delete", () => {
    // ─── Happy Path ───────────────────────────────────────────────
    test("PRM-070: 200 — delete existing permission", async ({ adminApi }) => {
      const { id } = await createPermission(adminApi);
      const res = await adminApi.delete(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`);
      expect([200, 204]).toContain(res.status());

      const verifyRes = await adminApi.get(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`);
      expect(verifyRes.status()).toBe(404);
    });

    test("PRM-074: 200 — response confirms deletion with message or data", async ({ adminApi }) => {
      const { id } = await createPermission(adminApi);
      const body = await (
        await adminApi.delete(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`)
      ).json();
      const hasMsg = typeof body.message === "string";
      const hasId = body.data?._id === id || body._id === id;
      expect(hasMsg || hasId, "DELETE must confirm what was deleted").toBe(true);
    });

    test("PRM-075: 200 — concurrent deletes — no 500, one wins", async ({ adminApi }) => {
      const { id } = await createPermission(adminApi);
      const [r1, r2] = await Promise.all([
        adminApi.delete(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`),
        adminApi.delete(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`),
      ]);
      expect(r1.status()).not.toBe(500);
      expect(r2.status()).not.toBe(500);
      expect([200, 204, 404]).toContain(r1.status());
      expect([200, 204, 404]).toContain(r2.status());
    });

    // ─── Validation ───────────────────────────────────────────────
    test("PRM-071: 404 — delete non-existent valid ObjectId", async ({ adminApi }) => {
      const res = await adminApi.delete(
        `${ENDPOINTS.ADMIN_PERMISSIONS}/000000000000000000000000`,
      );
      expect(res.status()).toBe(404);
    });

    test("PRM-072: 422 — delete invalid ObjectId format", async ({ adminApi }) => {
      const res = await adminApi.delete(
        `${ENDPOINTS.ADMIN_PERMISSIONS}/not-a-valid-id`,
      );
      expect(res.status()).toBe(422);
    });

    test("PRM-073: 404 or 200 — delete already deleted permission (idempotency)", async ({ adminApi }) => {
      const { id } = await createPermission(adminApi);
      await deletePermission(adminApi, id);
      const res = await adminApi.delete(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`);
      expect([200, 204, 404]).toContain(res.status());
    });

    // ─── Authorization ────────────────────────────────────────────
    test("PRM-080: 401 — no token", async ({ api, adminApi }) => {
      const { id } = await createPermission(adminApi);
      try {
        expect((await api.delete(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`)).status()).toBe(401);
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-081: 403 — partner role cannot delete permission", async ({ partnerApi, adminApi }) => {
      const { id } = await createPermission(adminApi);
      try {
        expect((await partnerApi.delete(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`)).status()).toBe(403);
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-082: 401 — expired JWT returns 401", async ({ api, adminApi }) => {
      const { id } = await createPermission(adminApi);
      const expired =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
        ".eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9" +
        ".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      try {
        const res = await api.delete(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`, {
          headers: { Authorization: `Bearer ${expired}` },
        });
        expect(res.status()).toBe(401);
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    // ─── Security ─────────────────────────────────────────────────
    test("PRM-085: path traversal in id — 422 or 404, never 500", async ({ adminApi }) => {
      const res = await adminApi.delete(`${ENDPOINTS.ADMIN_PERMISSIONS}/../../etc/passwd`);
      expect([422, 404]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("PRM-086: no stack trace or DB internals in error response", async ({ adminApi }) => {
      const text = await (
        await adminApi.delete(`${ENDPOINTS.ADMIN_PERMISSIONS}/000000000000000000000000`)
      ).text();
      expect(text).not.toMatch(/mongodb/i);
      expect(text).not.toMatch(/mongoose/i);
      expect(text).not.toMatch(/at Object\./);
      expect(text).not.toMatch(/\.js:\d+:\d+/);
    });

    test("PRM-087: no X-Powered-By header", async ({ adminApi }) => {
      const res = await adminApi.delete(
        `${ENDPOINTS.ADMIN_PERMISSIONS}/000000000000000000000000`,
      );
      expect(res.headers()["x-powered-by"]).toBeUndefined();
    });

    test("PRM-088: response Content-Type is application/json on all errors", async ({ adminApi }) => {
      const cases = [
        adminApi.delete(`${ENDPOINTS.ADMIN_PERMISSIONS}/bad-id`),
        adminApi.delete(`${ENDPOINTS.ADMIN_PERMISSIONS}/000000000000000000000000`),
      ];
      for (const p of cases) {
        const res = await p;
        expect(res.headers()["content-type"]).toContain("application/json");
      }
    });
  });
};

import { test, expect } from "../../../../fixtures/auth.fixture.js";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import {
  createPermission,
  deletePermission,
} from "../permissions.helpers.js";

export const deletePermissionSuites = () => {
  test.describe("5. DELETE /api/admin/permissions/:id — Delete", () => {
    test("PRM-070: 204 or 200 — delete existing permission", async ({
      adminApi,
    }) => {
      const { id } = await createPermission(adminApi);
      const res = await adminApi.delete(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`);
      expect([200, 204]).toContain(res.status());

      // Verify it's actually gone
      const verifyRes = await adminApi.get(
        `${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`,
      );
      expect(verifyRes.status()).toBe(404);
    });

    test("PRM-071: 404 — delete non-existent valid ObjectId", async ({
      adminApi,
    }) => {
      const res = await adminApi.delete(
        `${ENDPOINTS.ADMIN_PERMISSIONS}/000000000000000000000000`,
      );
      expect(res.status()).toBe(404);
    });

    test("PRM-072: 400 — delete invalid ObjectId format", async ({
      adminApi,
    }) => {
      const res = await adminApi.delete(
        `${ENDPOINTS.ADMIN_PERMISSIONS}/not-a-valid-id`,
      );
      expect(res.status()).toBe(400);
    });

    test("PRM-073: 404 — delete already deleted permission (idempotency check)", async ({
      adminApi,
    }) => {
      const { id } = await createPermission(adminApi);
      await deletePermission(adminApi, id);

      // Second delete
      const res = await adminApi.delete(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`);
      // Some APIs return 204 for idempotency, some 404. Check your implementation.
      expect([200, 204, 404]).toContain(res.status());
    });
  });
};

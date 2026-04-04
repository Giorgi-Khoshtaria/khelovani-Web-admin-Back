import { test, expect } from "../../../../fixtures/auth.fixture.js";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import {
  createPermission,
  deletePermission,
} from "../permissions.helpers.js";

export const getPermissionByIdSuites = () => {
  test.describe("3. GET /api/admin/permissions/:id — Get by ID", () => {
    test("PRM-040: 200 — returns full permission object", async ({
      adminApi,
    }) => {
      const { id, name } = await createPermission(adminApi);

      try {
        const res = await adminApi.get(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.name).toBe(name);
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-041: 200 — response has expected fields (id, name, description, category, createdAt)", async ({
      adminApi,
    }) => {
      const { id } = await createPermission(adminApi);

      try {
        const body = await (
          await adminApi.get(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`)
        ).json();
        expect(body).toHaveProperty("_id");
        expect(body).toHaveProperty("name");
        expect(body).toHaveProperty("description");
        expect(body).toHaveProperty("category");
        expect(body).toHaveProperty("createdAt");
        expect(body).toHaveProperty("updatedAt");
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-042: 200 — _id in response matches requested id", async ({
      adminApi,
    }) => {
      const { id } = await createPermission(adminApi);

      try {
        const body = await (
          await adminApi.get(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`)
        ).json();
        expect(body._id).toBe(id);
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-043: 404 — valid ObjectId that does not exist", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_PERMISSIONS}/000000000000000000000000`,
      );
      expect(res.status()).toBe(404);
    });

    test("PRM-044: 400 — invalid ObjectId format", async ({ adminApi }) => {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_PERMISSIONS}/not-a-valid-id`,
      );
      expect(res.status()).toBe(400);
    });

    test("PRM-045: 404 — deleted permission returns 404 (not stale data)", async ({
      adminApi,
    }) => {
      const { id } = await createPermission(adminApi);
      await deletePermission(adminApi, id);

      const res = await adminApi.get(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`);
      expect(res.status()).toBe(404);
    });

    test("PRM-048: 400 — path traversal in id → 400 or 404, never 500", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_PERMISSIONS}/../../etc/passwd`,
      );
      expect([400, 404]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });
  });
};

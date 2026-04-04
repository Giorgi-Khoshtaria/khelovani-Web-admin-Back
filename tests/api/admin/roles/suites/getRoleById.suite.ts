import { test, expect } from "../../../../fixtures/auth.fixture.js";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createRole, deleteRole } from "../roles.helpers.js";

export const getRoleByIdSuites = () => {
  test.describe("3. GET /api/admin/roles/:id — Get by ID", () => {
    test("ROL-050: 200 — returns full role object", async ({ adminApi }) => {
      const { id, name } = await createRole(adminApi);
      try {
        const body = await (
          await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/${id}`)
        ).json();
        expect(body.name).toBe(name);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-051: 200 — response has required fields", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      try {
        const body = await (
          await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/${id}`)
        ).json();
        expect(body).toHaveProperty("_id");
        expect(body).toHaveProperty("name");
        expect(body).toHaveProperty("description");
        expect(body).toHaveProperty("allowedPanels");
        expect(body).toHaveProperty("permissions");
        expect(body).toHaveProperty("createdAt");
        expect(body).toHaveProperty("updatedAt");
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-052: 200 — _id in response matches requested id", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      try {
        const body = await (
          await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/${id}`)
        ).json();
        expect(body._id).toBe(id);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-053: 404 — valid ObjectId that does not exist", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_ROLES}/000000000000000000000000`,
      );
      expect(res.status()).toBe(404);
    });

    test("ROL-054: 400 — invalid ObjectId format", async ({ adminApi }) => {
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/not-a-valid-id`);
      expect(res.status()).toBe(400);
    });

    test("ROL-055: 404 — deleted role returns 404 (no stale data)", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      await deleteRole(adminApi, id);
      expect(
        (await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/${id}`)).status(),
      ).toBe(404);
    });

    test("ROL-056: 401 — no token returns 401", async ({ api, adminApi }) => {
      const { id } = await createRole(adminApi);
      try {
        expect((await api.get(`${ENDPOINTS.ADMIN_ROLES}/${id}`)).status()).toBe(
          401,
        );
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-057: 403 — partner role cannot GET role by id", async ({
      partnerApi,
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      try {
        expect(
          (await partnerApi.get(`${ENDPOINTS.ADMIN_ROLES}/${id}`)).status(),
        ).toBe(403);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-058: 400 — path traversal in id — 400 or 404, never 500", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_ROLES}/../../etc/passwd`,
      );
      expect([400, 404]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });
  });
};

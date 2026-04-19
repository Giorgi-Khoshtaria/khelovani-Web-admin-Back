import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createRole, deleteRole } from "../roles.helpers.js";

export const getRoleByIdSuites = () => {
  test.describe("3. GET /api/admin/roles/:id — Get by ID", () => {
    test("ROL-050: 200 — returns full role object", async ({ adminApi }) => {
      const { id, name } = await createRole(adminApi);
      try {
        const body = await (await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/${id}`)).json();
        expect(body.data.name).toBe(name);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-051: 200 — response data has required fields", async ({ adminApi }) => {
      const { id } = await createRole(adminApi);
      try {
        const body = await (await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/${id}`)).json();
        expect(body.data).toHaveProperty("_id");
        expect(body.data).toHaveProperty("name");
        expect(body.data).toHaveProperty("description");
        expect(body.data).toHaveProperty("allowedPanels");
        expect(body.data).toHaveProperty("permissions");
        expect(body.data).toHaveProperty("createdAt");
        expect(body.data).toHaveProperty("updatedAt");
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-052: 200 — _id in data matches requested id", async ({ adminApi }) => {
      const { id } = await createRole(adminApi);
      try {
        const body = await (await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/${id}`)).json();
        expect(body.data._id).toBe(id);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-053: 404 — valid ObjectId that does not exist", async ({ adminApi }) => {
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/000000000000000000000000`);
      expect(res.status()).toBe(404);
    });

    test("ROL-054: 422 — invalid ObjectId format", async ({ adminApi }) => {
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/not-a-valid-id`);
      expect(res.status()).toBe(422);
    });

    test("ROL-055: 404 — deleted role returns 404 (no stale data)", async ({ adminApi }) => {
      const { id } = await createRole(adminApi);
      await deleteRole(adminApi, id);
      expect((await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/${id}`)).status()).toBe(404);
    });

    test("ROL-056: 401 — no token returns 401", async ({ api, adminApi }) => {
      const { id } = await createRole(adminApi);
      try {
        expect((await api.get(`${ENDPOINTS.ADMIN_ROLES}/${id}`)).status()).toBe(401);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-057: 403 — partner role cannot GET role by id", async ({ partnerApi, adminApi }) => {
      const { id } = await createRole(adminApi);
      try {
        expect((await partnerApi.get(`${ENDPOINTS.ADMIN_ROLES}/${id}`)).status()).toBe(403);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-058: path traversal in id — 422 or 404, never 500", async ({ adminApi }) => {
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/../../etc/passwd`);
      expect([422, 404]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });
  });
};

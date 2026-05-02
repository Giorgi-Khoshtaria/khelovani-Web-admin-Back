import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import {
  createEndUser,
  deleteEndUser,
} from "../../../../helpers/shared/users.helpers.js";

export const deleteUserSuites = () => {
  test.describe("3. DELETE /api/admin/users/:id — Delete Single User", () => {
    test("USR-030: 200 — delete existing user", async ({ adminApi }) => {
      const { id, email } = await createEndUser();
      try {
        const res = await adminApi.delete(`${ENDPOINTS.ADMIN_USERS}/${id}`);
        expect(res.status()).toBe(200);
      } finally {
        await deleteEndUser(id, email);
      }
    });

    test("USR-031: 404 — GET after delete returns 404", async ({
      adminApi,
    }) => {
      const { id, email } = await createEndUser();
      await adminApi.delete(`${ENDPOINTS.ADMIN_USERS}/${id}`);
      await deleteEndUser(id, email);

      const res = await adminApi.get(`${ENDPOINTS.ADMIN_USERS}/${id}`);
      expect(res.status()).toBe(404);
    });

    test("USR-032: 404 — delete non-existent valid ObjectId", async ({
      adminApi,
    }) => {
      const res = await adminApi.delete(
        `${ENDPOINTS.ADMIN_USERS}/000000000000000000000000`,
      );
      expect(res.status()).toBe(404);
    });

    test("USR-033: 422 — delete with invalid ObjectId format", async ({
      adminApi,
    }) => {
      const res = await adminApi.delete(
        `${ENDPOINTS.ADMIN_USERS}/not-a-valid-id`,
      );
      expect(res.status()).toBe(422);
    });

    test("USR-034: 404 — double delete returns 404 on second attempt", async ({
      adminApi,
    }) => {
      const { id, email } = await createEndUser();
      await adminApi.delete(`${ENDPOINTS.ADMIN_USERS}/${id}`);
      await deleteEndUser(id, email);

      const res = await adminApi.delete(`${ENDPOINTS.ADMIN_USERS}/${id}`);
      expect(res.status()).toBe(404);
    });

    test("USR-035: 401 — unauthenticated delete returns 401", async ({
      request,
    }) => {
      const { id, email } = await createEndUser();
      try {
        const res = await request.delete(`${ENDPOINTS.ADMIN_USERS}/${id}`);
        expect(res.status()).toBe(401);
      } finally {
        await deleteEndUser(id, email);
      }
    });
  });
};

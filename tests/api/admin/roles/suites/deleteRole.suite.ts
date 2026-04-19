import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import {
  createRole,
  deleteRole,
  createPermission,
  deletePermission,
} from "../roles.helpers.js";

export const deleteRoleSuites = () => {
  test.describe("5. DELETE /api/admin/roles/:id — Delete", () => {
    test("ROL-090: 200 — delete existing role", async ({ adminApi }) => {
      const { id } = await createRole(adminApi);
      expect(
        (await adminApi.delete(`${ENDPOINTS.ADMIN_ROLES}/${id}`)).status(),
      ).toBe(200);
    });

    test("ROL-091: 404 — GET after delete returns 404", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      await deleteRole(adminApi, id);
      expect(
        (await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/${id}`)).status(),
      ).toBe(404);
    });

    test("ROL-092: 404 — delete non-existent valid ObjectId", async ({
      adminApi,
    }) => {
      const res = await adminApi.delete(
        `${ENDPOINTS.ADMIN_ROLES}/000000000000000000000000`,
      );
      expect(res.status()).toBe(404);
    });

    test("ROL-093: 422 — invalid ObjectId format", async ({ adminApi }) => {
      const res = await adminApi.delete(
        `${ENDPOINTS.ADMIN_ROLES}/not-a-valid-id`,
      );
      expect(res.status()).toBe(422);
    });

    test("ROL-094: 404 — double delete returns 404 on second attempt", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      await adminApi.delete(`${ENDPOINTS.ADMIN_ROLES}/${id}`);
      expect(
        (await adminApi.delete(`${ENDPOINTS.ADMIN_ROLES}/${id}`)).status(),
      ).toBe(404);
    });

    test("ROL-095: 409 — cannot delete role assigned to an organization (constraint)", async ({
      adminApi,
    }) => {
      const { id: roleId } = await createRole(adminApi);

      const partnersRes = await adminApi.get(ENDPOINTS.ADMIN_PARTNERS);
      const partners = await partnersRes.json();

      if (!Array.isArray(partners.data) || partners.data.length === 0) {
        await deleteRole(adminApi, roleId);
        return;
      }

      const partner = partners.data[0];
      const partnerId = partner._id;
      const originalRoleId = partner.role?._id || partner.role;

      try {
        await adminApi.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${partnerId}`, {
          data: { role: roleId },
        });

        const res = await adminApi.delete(`${ENDPOINTS.ADMIN_ROLES}/${roleId}`);
        expect(res.status()).toBe(409);
      } finally {
        await adminApi.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${partnerId}`, {
          data: { role: originalRoleId },
        });
        await deleteRole(adminApi, roleId);
      }
    });

    test("ROL-096: 200 — deleting role does not cascade-delete its permissions", async ({
      adminApi,
    }) => {
      const { id: permId } = await createPermission(adminApi);
      const { id: roleId } = await createRole(adminApi, {
        permissions: [permId],
      });

      await deleteRole(adminApi, roleId);

      const permRes = await adminApi.get(
        `${ENDPOINTS.ADMIN_PERMISSIONS}/${permId}`,
      );
      expect(permRes.status()).toBe(200);

      await deletePermission(adminApi, permId);
    });

    test("ROL-097: 401 — no token returns 401", async ({ api, adminApi }) => {
      const { id } = await createRole(adminApi);
      try {
        expect(
          (await api.delete(`${ENDPOINTS.ADMIN_ROLES}/${id}`)).status(),
        ).toBe(401);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-098: 403 — partner role cannot delete", async ({
      partnerApi,
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      try {
        expect(
          (await partnerApi.delete(`${ENDPOINTS.ADMIN_ROLES}/${id}`)).status(),
        ).toBe(403);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-099: 200 — concurrent deletes — no 500, one wins", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      const [r1, r2] = await Promise.all([
        adminApi.delete(`${ENDPOINTS.ADMIN_ROLES}/${id}`),
        adminApi.delete(`${ENDPOINTS.ADMIN_ROLES}/${id}`),
      ]);
      expect(r1.status()).not.toBe(500);
      expect(r2.status()).not.toBe(500);
      expect([200, 404]).toContain(r1.status());
      expect([200, 404]).toContain(r2.status());
    });

    test("ROL-100: 422 — path traversal in id — 422 or 404, never 500", async ({
      adminApi,
    }) => {
      const res = await adminApi.delete(
        `${ENDPOINTS.ADMIN_ROLES}/../../etc/passwd`,
      );
      expect([422, 404]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("ROL-101: 200 — response confirms deletion with message or deleted object", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      const body = await (
        await adminApi.delete(`${ENDPOINTS.ADMIN_ROLES}/${id}`)
      ).json();
      const hasMsg = typeof body.message === "string";
      const hasId = body.data?._id === id || body._id === id;
      expect(hasMsg || hasId, "DELETE must confirm what was deleted").toBe(
        true,
      );
    });

    test("ROL-102: 200 — after role deleted, permissions previously on it still return 200", async ({
      adminApi,
    }) => {
      const { id: permId } = await createPermission(adminApi);
      const { id: roleId } = await createRole(adminApi, {
        permissions: [permId],
      });
      await deleteRole(adminApi, roleId);

      expect(
        (
          await adminApi.get(`${ENDPOINTS.ADMIN_PERMISSIONS}/${permId}`)
        ).status(),
      ).toBe(200);
      await deletePermission(adminApi, permId);
    });
  });
};

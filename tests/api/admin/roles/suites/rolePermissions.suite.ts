import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import {
  createRole,
  deleteRole,
  createPermission,
  deletePermission,
  uniqueName,
  VALID_ROLE,
} from "../roles.helpers.js";

export const rolePermissionsSuites = () => {
  test.describe("6. Permissions Assignment on Roles", () => {
    test("ROL-110: assigned permission appears in role GET by id", async ({
      adminApi,
    }) => {
      const { id: permId } = await createPermission(adminApi);
      const { id: roleId } = await createRole(adminApi, {
        permissions: [permId],
      });
      try {
        const body = await (
          await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/${roleId}`)
        ).json();
        const permIds = body.data.permissions.map((p: any) => p._id ?? p);
        expect(permIds).toContain(permId);
      } finally {
        await deleteRole(adminApi, roleId);
        await deletePermission(adminApi, permId);
      }
    });

    test("ROL-111: assigning permission to multiple roles is allowed", async ({
      adminApi,
    }) => {
      const { id: permId } = await createPermission(adminApi);
      const { id: roleId1 } = await createRole(adminApi, {
        permissions: [permId],
      });
      const { id: roleId2 } = await createRole(adminApi, {
        permissions: [permId],
      });
      try {
        const body1 = await (
          await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/${roleId1}`)
        ).json();
        const body2 = await (
          await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/${roleId2}`)
        ).json();
        expect(body1.data.permissions.map((p: any) => p._id ?? p)).toContain(permId);
        expect(body2.data.permissions.map((p: any) => p._id ?? p)).toContain(permId);
      } finally {
        await deleteRole(adminApi, roleId1);
        await deleteRole(adminApi, roleId2);
        await deletePermission(adminApi, permId);
      }
    });

    test("ROL-112: deleting a permission removes it from roles that had it", async ({
      adminApi,
    }) => {
      const { id: permId } = await createPermission(adminApi);
      const { id: roleId } = await createRole(adminApi, {
        permissions: [permId],
      });

      await deletePermission(adminApi, permId);

      const body = await (
        await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/${roleId}`)
      ).json();
      const permIds = body.data.permissions.map((p: any) => p._id ?? p);
      expect(permIds).not.toContain(permId);

      await deleteRole(adminApi, roleId);
    });

    test("ROL-113: role with 50 permissions assigned — no 500", async ({
      adminApi,
    }) => {
      let permIds: string[] = [];
      try {
        const permResults = await Promise.all(
          Array.from({ length: 50 }).map(() => createPermission(adminApi))
        );
        permIds = permResults.map(p => p.id);

        const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
          data: { ...VALID_ROLE, name: uniqueName(), permissions: permIds },
        });
        
        expect([201, 400]).toContain(res.status());
        expect(res.status()).not.toBe(500);
        
        if (res.status() === 201) {
          const body = await res.json();
          await deleteRole(adminApi, body.data?._id);
        }
      } finally {
        if (permIds.length > 0) {
          await Promise.allSettled(
            permIds.map(id => deletePermission(adminApi, id))
          );
        }
      }
    });
  });
};

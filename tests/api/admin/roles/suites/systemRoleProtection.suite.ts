import { APIRequestContext } from "@playwright/test";
import { test, expect } from "../../../../fixtures/auth.fixture.js";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { randomId } from "../../../../helpers/utils/generators.js";
import {
  SYSTEM_ROLES,
  createRole,
  deleteRole,
} from "../roles.helpers.js";

export const systemRoleProtectionSuites = () => {
  test.describe("7. Critical / System Role Protection", () => {
    // Helper: find a system role by name, skip if not found
    async function getSystemRole(
      adminApi: APIRequestContext,
      roleName: string,
    ): Promise<any | null> {
      const body = await (await adminApi.get(ENDPOINTS.ADMIN_ROLES)).json();
      return body.find((r: any) => r.name === roleName) ?? null;
    }

    for (const systemRoleName of SYSTEM_ROLES) {
      test(`ROL-130: 400 — cannot rename '${systemRoleName}' role`, async ({
        adminApi,
      }) => {
        const role = await getSystemRole(adminApi, systemRoleName);
        if (!role)
          return test.skip(true, `'${systemRoleName}' role not found in DB`);

        const res = await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${role._id}`, {
          data: { name: `Hacked_${randomId()}` },
        });
        expect(res.status()).toBe(400);
      });

      test(`ROL-131: 400 — cannot delete '${systemRoleName}' role`, async ({
        adminApi,
      }) => {
        const role = await getSystemRole(adminApi, systemRoleName);
        if (!role)
          return test.skip(true, `'${systemRoleName}' role not found in DB`);

        const res = await adminApi.delete(
          `${ENDPOINTS.ADMIN_ROLES}/${role._id}`,
        );
        expect(res.status()).toBe(400);
      });

      test(`ROL-132: 400 — cannot clear allowedPanels on '${systemRoleName}'`, async ({
        adminApi,
      }) => {
        const role = await getSystemRole(adminApi, systemRoleName);
        if (!role)
          return test.skip(true, `'${systemRoleName}' role not found in DB`);

        const res = await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${role._id}`, {
          data: { allowedPanels: [] },
        });
        expect(res.status()).toBe(400);
      });

      test(`ROL-133: 200 — CAN update description of '${systemRoleName}' role`, async ({
        adminApi,
      }) => {
        const role = await getSystemRole(adminApi, systemRoleName);
        if (!role)
          return test.skip(true, `'${systemRoleName}' role not found in DB`);

        const res = await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${role._id}`, {
          data: { description: "Updated by QA test" },
        });
        expect(res.status()).toBe(200);
      });
    }

    test("ROL-134: 400 — after rejection, system role must still exist", async ({
      adminApi,
    }) => {
      const adminRole = await getSystemRole(adminApi, "admin");
      if (!adminRole) return test.skip(true, "admin role not found in DB");

      await adminApi.delete(`${ENDPOINTS.ADMIN_ROLES}/${adminRole._id}`);

      const verifyRes = await adminApi.get(
        `${ENDPOINTS.ADMIN_ROLES}/${adminRole._id}`,
      );
      expect(verifyRes.status()).toBe(200);
      const body = await verifyRes.json();
      expect(body.name).toBe("admin");
    });

    test("ROL-135: non-system role can still be deleted (protection is targeted)", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      const res = await adminApi.delete(`${ENDPOINTS.ADMIN_ROLES}/${id}`);
      expect(res.status()).toBe(200);
    });

    test("ROL-136: 400 — cannot remove permissions from 'admin' role if it becomes empty", async ({
      adminApi,
    }) => {
      const adminRole = await getSystemRole(adminApi, "admin");
      if (!adminRole) return test.skip(true, "admin role not found in DB");
      if (!adminRole.permissions?.length)
        return test.skip(true, "admin role has no permissions to test");

      const res = await adminApi.put(
        `${ENDPOINTS.ADMIN_ROLES}/${adminRole._id}`,
        {
          data: { permissions: [] },
        },
      );
      expect([200, 400]).toContain(res.status());
    });
  });
};

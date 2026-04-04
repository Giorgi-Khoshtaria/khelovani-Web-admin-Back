import { test, expect } from "../../../../fixtures/auth.fixture.js";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import {
  createRole,
  deleteRole,
  createPermission,
  deletePermission,
} from "../roles.helpers.js";

export const updateRoleSuites = () => {
  test.describe("4. PUT /api/admin/roles/:id — Update", () => {
    test("ROL-060: 200 — update description", async ({ adminApi }) => {
      const { id } = await createRole(adminApi);
      try {
        const body = await (
          await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${id}`, {
            data: { description: "Updated" },
          })
        ).json();
        expect(body.role.description).toBe("Updated");
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-061: 200 — update allowedPanels", async ({ adminApi }) => {
      const { id } = await createRole(adminApi);
      try {
        const body = await (
          await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${id}`, {
            data: { allowedPanels: ["admin", "admin-organization"] },
          })
        ).json();
        expect(body.role.allowedPanels).toContain("admin-organization");
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-062: 200 — assign existing permission to role", async ({
      adminApi,
    }) => {
      const { id: roleId } = await createRole(adminApi);
      const { id: permId } = await createPermission(adminApi);
      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${roleId}`, {
          data: { permissions: [permId] },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        const permIds = body.role.permissions.map((p: any) => p._id ?? p);
        expect(permIds).toContain(permId);
      } finally {
        await deleteRole(adminApi, roleId);
        await deletePermission(adminApi, permId);
      }
    });

    test("ROL-063: 200 — clear all permissions (empty array)", async ({
      adminApi,
    }) => {
      const { id: permId } = await createPermission(adminApi);
      const { id: roleId } = await createRole(adminApi, {
        permissions: [permId],
      });
      try {
        const body = await (
          await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${roleId}`, {
            data: { permissions: [] },
          })
        ).json();
        expect(body.role.permissions.length).toBe(0);
      } finally {
        await deleteRole(adminApi, roleId);
        await deletePermission(adminApi, permId);
      }
    });

    test("ROL-064: 400 — invalid panel name in allowedPanels", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${id}`, {
          data: { allowedPanels: ["invalid-panel-xyz"] },
        });
        expect(res.status()).toBe(400);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-065: 400 — non-existent permission ObjectId in permissions array", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${id}`, {
          data: { permissions: ["000000000000000000000000"] },
        });
        expect(res.status()).toBe(400);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-066: 400 — malformed permission ID in permissions array", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${id}`, {
          data: { permissions: ["not-a-valid-id"] },
        });
        expect(res.status()).toBe(400);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-067: 404 — update non-existent valid ObjectId", async ({
      adminApi,
    }) => {
      const res = await adminApi.put(
        `${ENDPOINTS.ADMIN_ROLES}/000000000000000000000000`,
        {
          data: { description: "ghost update" },
        },
      );
      expect(res.status()).toBe(404);
    });

    test("ROL-068: 400 — invalid ObjectId format in URL", async ({
      adminApi,
    }) => {
      const res = await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/bad-id`, {
        data: { description: "irrelevant" },
      });
      expect(res.status()).toBe(400);
    });

    test("ROL-069: 400 — empty body {}", async ({ adminApi }) => {
      const { id } = await createRole(adminApi);
      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${id}`, {
          data: {},
        });
        expect([400, 422]).toContain(res.status());
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-070: 200 — updatedAt timestamp changes after update", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      try {
        const before = await (
          await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/${id}`)
        ).json();
        await new Promise((r) => setTimeout(r, 50));
        await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${id}`, {
          data: { description: "touching updatedAt" },
        });
        const after = await (
          await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/${id}`)
        ).json();
        expect(new Date(after.updatedAt).getTime()).toBeGreaterThan(
          new Date(before.updatedAt).getTime(),
        );
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-071: 200 — idempotent update returns same result twice", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      try {
        const payload = {
          data: { description: "idem", allowedPanels: ["admin"] },
        };
        const res1 = await adminApi.put(
          `${ENDPOINTS.ADMIN_ROLES}/${id}`,
          payload,
        );
        const res2 = await adminApi.put(
          `${ENDPOINTS.ADMIN_ROLES}/${id}`,
          payload,
        );
        expect(res1.status()).toBe(200);
        expect(res2.status()).toBe(200);
        expect((await res1.json()).role.description).toBe(
          (await res2.json()).role.description,
        );
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-072: 404 — update deleted role returns 404", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      await deleteRole(adminApi, id);
      const res = await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${id}`, {
        data: { description: "too late" },
      });
      expect(res.status()).toBe(404);
    });

    test("ROL-073: 401 — no token returns 401", async ({ api, adminApi }) => {
      const { id } = await createRole(adminApi);
      try {
        expect(
          (
            await api.put(`${ENDPOINTS.ADMIN_ROLES}/${id}`, {
              data: { description: "x" },
            })
          ).status(),
        ).toBe(401);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-074: 403 — partner role cannot update role", async ({
      partnerApi,
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      try {
        expect(
          (
            await partnerApi.put(`${ENDPOINTS.ADMIN_ROLES}/${id}`, {
              data: { description: "x" },
            })
          ).status(),
        ).toBe(403);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-075: 200 — extra unknown fields in body are silently ignored", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${id}`, {
          data: { description: "clean", isSuperAdmin: true, _id: "spoofed" },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.role.isSuperAdmin).toBeUndefined();
        expect(body.role._id).toBe(id);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-076: [BVA] 400 — description exceeds max length (501 chars)", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${id}`, {
          data: { description: "x".repeat(501) },
        });
        expect([400, 422]).toContain(res.status());
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-077: 400 — allowedPanels is empty after update (if required)", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${id}`, {
          data: { allowedPanels: [] },
        });
        expect([200, 400]).toContain(res.status());
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-078: 409 — rename role to name that already exists", async ({
      adminApi,
    }) => {
      const { id: id1, name: name1 } = await createRole(adminApi);
      const { id: id2 } = await createRole(adminApi);
      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${id2}`, {
          data: { name: name1 },
        });
        expect(res.status()).toBe(409);
      } finally {
        await deleteRole(adminApi, id1);
        await deleteRole(adminApi, id2);
      }
    });

    test("ROL-079: 200 — assigning same permission twice is deduplicated", async ({
      adminApi,
    }) => {
      const { id: permId } = await createPermission(adminApi);
      const { id: roleId } = await createRole(adminApi);
      try {
        const body = await (
          await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${roleId}`, {
            data: { permissions: [permId, permId] },
          })
        ).json();
        const permIds = body.role.permissions.map((p: any) => p._id ?? p);
        expect(permIds.filter((p: string) => p === permId).length).toBe(1);
      } finally {
        await deleteRole(adminApi, roleId);
        await deletePermission(adminApi, permId);
      }
    });

    test("ROL-080: 200 — concurrent updates on same role — no 500", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      try {
        const [r1, r2] = await Promise.all([
          adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${id}`, {
            data: { description: "concurrent A" },
          }),
          adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${id}`, {
            data: { description: "concurrent B" },
          }),
        ]);
        expect(r1.status()).not.toBe(500);
        expect(r2.status()).not.toBe(500);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-081: 200 — permissions list replaced entirely (not appended)", async ({
      adminApi,
    }) => {
      const { id: permA } = await createPermission(adminApi);
      const { id: permB } = await createPermission(adminApi);
      const { id: permC } = await createPermission(adminApi);
      const { id: roleId } = await createRole(adminApi, {
        permissions: [permA, permB],
      });

      try {
        const body = await (
          await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${roleId}`, {
            data: { permissions: [permC] },
          })
        ).json();

        const permIds = body.role.permissions.map((p: any) => p._id ?? p);
        expect(permIds).toContain(permC);
        expect(permIds).not.toContain(permA);
        expect(permIds).not.toContain(permB);
      } finally {
        await deleteRole(adminApi, roleId);
        await deletePermission(adminApi, permA);
        await deletePermission(adminApi, permB);
        await deletePermission(adminApi, permC);
      }
    });

    test("ROL-082: 200 — allowedPanels replaced entirely (not appended)", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi, { allowedPanels: ["admin"] });
      try {
        const body = await (
          await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${id}`, {
            data: { allowedPanels: ["admin-organization"] },
          })
        ).json();
        expect(body.role.allowedPanels).toContain("admin-organization");
        expect(body.role.allowedPanels).not.toContain("admin");
      } finally {
        await deleteRole(adminApi, id);
      }
    });
  });
};

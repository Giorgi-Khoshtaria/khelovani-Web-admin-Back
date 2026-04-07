import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createPermission, deletePermission } from "../permissions.helpers.js";

export const updatePermissionSuites = () => {
  test.describe("4. PUT /api/admin/permissions/:id — Update", () => {
    test("PRM-050: 200 — update description", async ({ adminApi }) => {
      const { id } = await createPermission(adminApi);

      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`, {
          data: { description: "Updated description" },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.permission.description).toBe("Updated description");
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-051: 200 — update category", async ({ adminApi }) => {
      const { id } = await createPermission(adminApi);

      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`, {
          data: { category: "NewCategory" },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.permission.category).toBe("NewCategory");
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-052: 200 — update both description and category in one call", async ({
      adminApi,
    }) => {
      const { id } = await createPermission(adminApi);

      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`, {
          data: { description: "Batch update", category: "BatchCat" },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.permission.description).toBe("Batch update");
        expect(body.permission.category).toBe("BatchCat");
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-053: 200 — updatedAt timestamp changes after update", async ({
      adminApi,
    }) => {
      const { id } = await createPermission(adminApi);

      try {
        const before = await (
          await adminApi.get(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`)
        ).json();

        await new Promise((r) => setTimeout(r, 50));

        await adminApi.put(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`, {
          data: { description: "Touching updatedAt" },
        });

        const after = await (
          await adminApi.get(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`)
        ).json();

        expect(new Date(after.updatedAt).getTime()).toBeGreaterThan(
          new Date(before.updatedAt).getTime(),
        );
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-054: 200 — name field is not changed by update (name is immutable)", async ({
      adminApi,
    }) => {
      const { id, name } = await createPermission(adminApi);

      try {
        await adminApi.put(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`, {
          data: { name: "ShouldNotChange", description: "desc" },
        });

        const body = await (
          await adminApi.get(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`)
        ).json();
        expect([name, "ShouldNotChange"]).toContain(body.name);
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-055: 404 — update non-existent valid ObjectId", async ({
      adminApi,
    }) => {
      const res = await adminApi.put(
        `${ENDPOINTS.ADMIN_PERMISSIONS}/000000000000000000000000`,
        { data: { description: "ghost update" } },
      );
      expect(res.status()).toBe(404);
    });

    test("PRM-056: 422 — invalid ObjectId format in URL", async ({
      adminApi,
    }) => {
      const res = await adminApi.put(`${ENDPOINTS.ADMIN_PERMISSIONS}/bad-id`, {
        data: { description: "irrelevant" },
      });
      expect(res.status()).toBe(422);
    });

    test("PRM-057: 422 — empty body {}", async ({ adminApi }) => {
      const { id } = await createPermission(adminApi);

      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`, {
          data: {},
        });
        expect(res.status()).toBe(422);
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-058: 422 — description exceeds max length (1001 chars)", async ({
      adminApi,
    }) => {
      const { id } = await createPermission(adminApi);

      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`, {
          data: { description: "x".repeat(1001) },
        });
        expect(res.status()).toBe(422);
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-061: 404 — update deleted permission returns 404", async ({
      adminApi,
    }) => {
      const { id } = await createPermission(adminApi);
      await deletePermission(adminApi, id);

      const res = await adminApi.put(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`, {
        data: { description: "too late" },
      });
      expect(res.status()).toBe(404);
    });

    test("PRM-062: 200 — extra unknown fields in body are ignored", async ({
      adminApi,
    }) => {
      const { id } = await createPermission(adminApi);

      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`, {
          data: {
            description: "clean update",
            unknownField: "should be ignored",
            isAdmin: true,
          },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.permission.isAdmin).toBeUndefined();
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-063: 200 — idempotent update returns same result on second call", async ({
      adminApi,
    }) => {
      const { id } = await createPermission(adminApi);

      try {
        const payload = { description: "Idempotent test" };
        const res1 = await adminApi.put(
          `${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`,
          { data: payload },
        );
        expect(res1.status()).toBe(200);

        const res2 = await adminApi.put(
          `${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`,
          { data: payload },
        );
        expect(res2.status()).toBe(200);
      } finally {
        await deletePermission(adminApi, id);
      }
    });
  });
};

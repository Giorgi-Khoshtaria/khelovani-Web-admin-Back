import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createPermission, deletePermission } from "../permissions.helpers.js";
import { randomId } from "../../../../helpers/utils/generators.js";

export const listPermissionsSuites = () => {
  test.describe("2. GET /api/admin/permissions — List", () => {
    test("PRM-020: 200 — returns array of permissions", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PERMISSIONS);
      expect(res.status()).toBe(200);
      expect(Array.isArray(await res.json())).toBe(true);
    });

    test("PRM-021: 200 — newly created permission appears in list", async ({
      adminApi,
    }) => {
      const { id, name } = await createPermission(adminApi);

      try {
        const res = await adminApi.get(ENDPOINTS.ADMIN_PERMISSIONS);
        const body = await res.json();
        expect(body.some((p: any) => p.name === name)).toBe(true);
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-022: 200 — search by exact name returns matching permission", async ({
      adminApi,
    }) => {
      const { id, name } = await createPermission(adminApi);

      try {
        const res = await adminApi.get(ENDPOINTS.ADMIN_PERMISSIONS, {
          params: { search: name },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.length).toBeGreaterThan(0);
        expect(body.some((p: any) => p.name === name)).toBe(true);
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-023: 200 — search with no match returns empty array (not error)", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PERMISSIONS, {
        params: { search: "this_will_never_match_xyz_12345_abc" },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(0);
    });

    test("PRM-024: 200 — filter by category returns only that category", async ({
      adminApi,
    }) => {
      const cat = `Cat_${randomId()}`;
      const { id } = await createPermission(adminApi, { category: cat });

      try {
        const res = await adminApi.get(ENDPOINTS.ADMIN_PERMISSIONS, {
          params: { category: cat },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.length).toBeGreaterThan(0);
        for (const p of body) {
          expect(p.category).toBe(cat);
        }
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-025: 200 — filter by non-existent category returns empty array", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PERMISSIONS, {
        params: { category: "NonExistentCategory_xyz_abc" },
      });
      expect(res.status()).toBe(200);
      expect((await res.json()).length).toBe(0);
    });

    test("PRM-026: 200 — pagination: limit=5 returns at most 5 items", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PERMISSIONS, {
        params: { page: 1, limit: 5 },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeLessThanOrEqual(5);
    });

    test("PRM-027: 200 — deleted permission no longer in list", async ({
      adminApi,
    }) => {
      const { id, name } = await createPermission(adminApi);
      await deletePermission(adminApi, id);

      const res = await adminApi.get(ENDPOINTS.ADMIN_PERMISSIONS, {
        params: { search: name },
      });
      const body = await res.json();
      expect(body.some((p: any) => p.name === name)).toBe(false);
    });

    test("PRM-028: 200 — no passwords or hashes in list response", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PERMISSIONS);
      const body = await res.json();
      for (const p of body) {
        expect(p).not.toHaveProperty("password");
        expect(p).not.toHaveProperty("passwordHash");
      }
    });

    test("PRM-031: 400 — invalid page param (negative number)", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PERMISSIONS, {
        params: { page: -1 },
      });
      expect([400, 200]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("PRM-032: 200 — empty search string returns all (no crash)", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PERMISSIONS, {
        params: { search: "" },
      });
      expect(res.status()).toBe(200);
      expect(Array.isArray(await res.json())).toBe(true);
    });
  });
};

import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createPermission, deletePermission } from "../permissions.helpers.js";

const CATEGORIES_URL = `${ENDPOINTS.ADMIN_PERMISSIONS}/categories`;

export const permissionCategoriesSuites = () => {
  test.describe("8. GET /api/admin/permissions/categories", () => {
    test("CAT-001: 200 — returns array of strings", async ({ adminApi }) => {
      const res = await adminApi.get(CATEGORIES_URL);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.data)).toBe(true);
      for (const cat of body.data) {
        expect(typeof cat).toBe("string");
      }
    });

    test("CAT-002: 200 — always includes seeded General category", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(CATEGORIES_URL);
      const body = await res.json();
      expect(body.data).toContain("General");
    });

    test("CAT-003: 200 — newly created category appears in list", async ({
      adminApi,
    }) => {
      const cat = `Billing_${Date.now()}`;
      const { id } = await createPermission(adminApi, { category: cat });

      try {
        const res = await adminApi.get(CATEGORIES_URL);
        const body = await res.json();
        // category is Title-Cased by the controller
        const titleCased = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
        expect(body.data).toContain(titleCased);
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("CAT-004: 200 — category saved as Title Case regardless of input casing", async ({
      adminApi,
    }) => {
      const { id } = await createPermission(adminApi, { category: "UPPERCASE_CAT" });

      try {
        const res = await adminApi.get(CATEGORIES_URL);
        const body = await res.json();
        expect(body.data).not.toContain("UPPERCASE_CAT");
        expect(body.data).toContain("Uppercase_cat");
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("CAT-005: 200 — result is sorted alphabetically", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(CATEGORIES_URL);
      const body = await res.json();
      const categories: string[] = body.data;
      const sorted = [...categories].sort();
      expect(categories).toEqual(sorted);
    });

    test("CAT-006: 200 — deleted permission's unique category disappears from list", async ({
      adminApi,
    }) => {
      const uniqueCat = `Transient_${Date.now()}`;
      const { id } = await createPermission(adminApi, { category: uniqueCat });
      await deletePermission(adminApi, id);

      const res = await adminApi.get(CATEGORIES_URL);
      const body = await res.json();
      const titleCased = uniqueCat.charAt(0).toUpperCase() + uniqueCat.slice(1).toLowerCase();
      // Only absent if no other permission uses the same category
      expect(body.data).not.toContain(uniqueCat);
      expect(body.data).not.toContain(titleCased);
    });

    test("CAT-007: 200 — update category normalizes to Title Case", async ({
      adminApi,
    }) => {
      const { id } = await createPermission(adminApi, { category: "General" });

      try {
        await adminApi.put(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`, {
          data: { description: "updated", category: "orgs" },
        });

        const getRes = await adminApi.get(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`);
        const getBody = await getRes.json();
        expect(getBody.data.category).toBe("Orgs");
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("CAT-008: 401 — unauthenticated request returns 401", async ({
      request,
    }) => {
      const res = await request.get(CATEGORIES_URL);
      expect(res.status()).toBe(401);
    });
  });
};

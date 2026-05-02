import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createCategory, deleteCategory, uniqueSlug, uniqueNameGe, uniqueNameEn } from "../categories.helpers.js";

export const listCategoriesSuites = () => {
  test.describe("2. GET /api/admin/categories — List", () => {
    test("CAT-030: 200 — returns array", async ({ adminApi }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_CATEGORIES);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.data)).toBe(true);
    });

    test("CAT-031: 200 — created category appears in list", async ({ adminApi }) => {
      const { id, slug } = await createCategory(adminApi);
      try {
        const body = await (await adminApi.get(ENDPOINTS.ADMIN_CATEGORIES)).json();
        const found = body.data.find((c: any) => c.slug === slug);
        expect(found).toBeDefined();
      } finally {
        await deleteCategory(adminApi, id);
      }
    });

    test("CAT-032: 200 — ?active=true filters active only", async ({ adminApi }) => {
      const { id } = await createCategory(adminApi, {
        slug: uniqueSlug("active"),
        nameGe: uniqueNameGe(),
        nameEn: uniqueNameEn(),
        isActive: true,
      });
      try {
        const body = await (
          await adminApi.get(ENDPOINTS.ADMIN_CATEGORIES, { params: { active: "true" } })
        ).json();
        for (const c of body.data) {
          expect(c.isActive).toBe(true);
        }
      } finally {
        await deleteCategory(adminApi, id);
      }
    });

    test("CAT-033: 200 — ?active=false filters inactive only", async ({ adminApi }) => {
      const { id } = await createCategory(adminApi, {
        slug: uniqueSlug("inactive"),
        nameGe: uniqueNameGe(),
        nameEn: uniqueNameEn(),
        isActive: false,
      });
      try {
        const body = await (
          await adminApi.get(ENDPOINTS.ADMIN_CATEGORIES, { params: { active: "false" } })
        ).json();
        for (const c of body.data) {
          expect(c.isActive).toBe(false);
        }
      } finally {
        await deleteCategory(adminApi, id);
      }
    });

    test("CAT-034: 200 — items have expected shape", async ({ adminApi }) => {
      const { id } = await createCategory(adminApi);
      try {
        const body = await (await adminApi.get(ENDPOINTS.ADMIN_CATEGORIES)).json();
        for (const c of body.data) {
          expect(c).toHaveProperty("_id");
          expect(c).toHaveProperty("slug");
          expect(c).toHaveProperty("nameGe");
          expect(c).toHaveProperty("nameEn");
          expect(c).toHaveProperty("isActive");
          expect(c).toHaveProperty("createdAt");
        }
      } finally {
        await deleteCategory(adminApi, id);
      }
    });
  });
};

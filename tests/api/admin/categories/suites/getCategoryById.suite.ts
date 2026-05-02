import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createCategory, deleteCategory } from "../categories.helpers.js";

export const getCategoryByIdSuites = () => {
  test.describe("3. GET /api/admin/categories/:id — Get by ID", () => {
    test("CAT-040: 200 — fetch existing category", async ({ adminApi }) => {
      const { id, slug } = await createCategory(adminApi);
      try {
        const res = await adminApi.get(`${ENDPOINTS.ADMIN_CATEGORIES}/${id}`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.data.slug).toBe(slug);
        expect(body.data._id).toBe(id);
      } finally {
        await deleteCategory(adminApi, id);
      }
    });

    test("CAT-041: 404 — non-existent valid ObjectId", async ({ adminApi }) => {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_CATEGORIES}/000000000000000000000000`,
      );
      expect(res.status()).toBe(404);
    });

    test("CAT-042: 422 — invalid ObjectId format", async ({ adminApi }) => {
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_CATEGORIES}/not-an-id`);
      expect(res.status()).toBe(422);
    });
  });
};

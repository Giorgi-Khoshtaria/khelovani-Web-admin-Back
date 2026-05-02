import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createCategory, deleteCategory } from "../categories.helpers.js";

export const deleteCategorySuites = () => {
  test.describe("5. DELETE /api/admin/categories/:id — Delete", () => {
    test("CAT-060: 200 — delete free category", async ({ adminApi }) => {
      const { id } = await createCategory(adminApi);
      const res = await adminApi.delete(`${ENDPOINTS.ADMIN_CATEGORIES}/${id}`);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data._id).toBe(id);
    });

    test("CAT-061: 404 — delete non-existent", async ({ adminApi }) => {
      const res = await adminApi.delete(
        `${ENDPOINTS.ADMIN_CATEGORIES}/000000000000000000000000`,
      );
      expect(res.status()).toBe(404);
    });

    test("CAT-062: 422 — invalid ID format", async ({ adminApi }) => {
      const res = await adminApi.delete(`${ENDPOINTS.ADMIN_CATEGORIES}/bad-id`);
      expect(res.status()).toBe(422);
    });

    test("CAT-063: 404 — deleted category is gone on GET", async ({ adminApi }) => {
      const { id } = await createCategory(adminApi);
      await adminApi.delete(`${ENDPOINTS.ADMIN_CATEGORIES}/${id}`);
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_CATEGORIES}/${id}`);
      expect(res.status()).toBe(404);
    });
  });
};

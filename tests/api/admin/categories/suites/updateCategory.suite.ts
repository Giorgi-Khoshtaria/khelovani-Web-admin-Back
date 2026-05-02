import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import {
  createCategory,
  deleteCategory,
  uniqueSlug,
  uniqueNameGe,
  uniqueNameEn,
} from "../categories.helpers.js";

export const updateCategorySuites = () => {
  test.describe("4. PUT /api/admin/categories/:id — Update", () => {
    test("CAT-050: 200 — update nameEn", async ({ adminApi }) => {
      const { id } = await createCategory(adminApi);
      try {
        const newName = uniqueNameEn();
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_CATEGORIES}/${id}`, {
          data: { nameEn: newName },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.data.nameEn).toBe(newName);
      } finally {
        await deleteCategory(adminApi, id);
      }
    });

    test("CAT-051: 200 — update nameGe", async ({ adminApi }) => {
      const { id } = await createCategory(adminApi);
      try {
        const newName = uniqueNameGe();
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_CATEGORIES}/${id}`, {
          data: { nameGe: newName },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.data.nameGe).toBe(newName);
      } finally {
        await deleteCategory(adminApi, id);
      }
    });

    test("CAT-052: 200 — toggle isActive to false", async ({ adminApi }) => {
      const { id } = await createCategory(adminApi);
      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_CATEGORIES}/${id}`, {
          data: { isActive: false },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.data.isActive).toBe(false);
      } finally {
        await deleteCategory(adminApi, id);
      }
    });

    test("CAT-053: 409 — slug conflict with existing", async ({ adminApi }) => {
      const { id: id1, slug: slug1 } = await createCategory(adminApi);
      const { id: id2 } = await createCategory(adminApi);
      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_CATEGORIES}/${id2}`, {
          data: { slug: slug1 },
        });
        expect(res.status()).toBe(409);
      } finally {
        await deleteCategory(adminApi, id1);
        await deleteCategory(adminApi, id2);
      }
    });

    test("CAT-054: 422 — empty update body", async ({ adminApi }) => {
      const { id } = await createCategory(adminApi);
      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_CATEGORIES}/${id}`, {
          data: {},
        });
        expect(res.status()).toBe(422);
      } finally {
        await deleteCategory(adminApi, id);
      }
    });

    test("CAT-055: 404 — update non-existent", async ({ adminApi }) => {
      const res = await adminApi.put(
        `${ENDPOINTS.ADMIN_CATEGORIES}/000000000000000000000000`,
        { data: { nameEn: uniqueNameEn() } },
      );
      expect(res.status()).toBe(404);
    });

    test("CAT-056: 422 — slug too long (51 chars)", async ({ adminApi }) => {
      const { id } = await createCategory(adminApi);
      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_CATEGORIES}/${id}`, {
          data: { slug: "a".repeat(51) },
        });
        expect(res.status()).toBe(422);
      } finally {
        await deleteCategory(adminApi, id);
      }
    });

    test("CAT-057: 422 — nameEn with Georgian chars", async ({ adminApi }) => {
      const { id } = await createCategory(adminApi);
      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_CATEGORIES}/${id}`, {
          data: { nameEn: "სამკაული" },
        });
        expect(res.status()).toBe(422);
      } finally {
        await deleteCategory(adminApi, id);
      }
    });

    test("CAT-058: 200 — slug is lowercased automatically", async ({ adminApi }) => {
      const { id } = await createCategory(adminApi);
      try {
        const newSlug = uniqueSlug("upd");
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_CATEGORIES}/${id}`, {
          data: { slug: newSlug },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.data.slug).toBe(newSlug.toLowerCase());
      } finally {
        await deleteCategory(adminApi, id);
      }
    });
  });
};

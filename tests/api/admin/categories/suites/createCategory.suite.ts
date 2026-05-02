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

export const createCategorySuites = () => {
  test.describe("1. POST /api/admin/categories — Create", () => {
    test("CAT-001: 201 — create category with all valid fields", async ({ adminApi }) => {
      const slug = uniqueSlug();
      const nameGe = uniqueNameGe();
      const nameEn = uniqueNameEn();
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { slug, nameGe, nameEn },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.data.slug).toBe(slug);
      expect(body.data.nameGe).toBe(nameGe);
      expect(body.data.nameEn).toBe(nameEn);
      expect(body.data.isActive).toBe(true);
      await deleteCategory(adminApi, body.data._id);
    });

    test("CAT-002: 201 — isActive defaults to true when omitted", async ({ adminApi }) => {
      const { id } = await createCategory(adminApi);
      const body = await (await adminApi.get(`${ENDPOINTS.ADMIN_CATEGORIES}/${id}`)).json();
      expect(body.data.isActive).toBe(true);
      await deleteCategory(adminApi, id);
    });

    test("CAT-003: 201 — create with isActive=false", async ({ adminApi }) => {
      const slug = uniqueSlug();
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { slug, nameGe: uniqueNameGe(), nameEn: uniqueNameEn(), isActive: false },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.data.isActive).toBe(false);
      await deleteCategory(adminApi, body.data._id);
    });

    test("CAT-004: 409 — duplicate slug returns conflict", async ({ adminApi }) => {
      const { id, slug } = await createCategory(adminApi);
      try {
        const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
          data: { slug, nameGe: uniqueNameGe(), nameEn: uniqueNameEn() },
        });
        expect(res.status()).toBe(409);
      } finally {
        await deleteCategory(adminApi, id);
      }
    });

    test("CAT-005: 409 — duplicate nameGe returns conflict", async ({ adminApi }) => {
      const nameGe = uniqueNameGe();
      const { id } = await createCategory(adminApi, { nameGe });
      try {
        const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
          data: { slug: uniqueSlug(), nameGe, nameEn: uniqueNameEn() },
        });
        expect(res.status()).toBe(409);
      } finally {
        await deleteCategory(adminApi, id);
      }
    });

    test("CAT-006: 409 — duplicate nameEn returns conflict", async ({ adminApi }) => {
      const nameEn = uniqueNameEn();
      const { id } = await createCategory(adminApi, { nameEn });
      try {
        const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
          data: { slug: uniqueSlug(), nameGe: uniqueNameGe(), nameEn },
        });
        expect(res.status()).toBe(409);
      } finally {
        await deleteCategory(adminApi, id);
      }
    });

    test("CAT-007: 422 — missing slug", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { nameGe: uniqueNameGe(), nameEn: uniqueNameEn() },
      });
      expect(res.status()).toBe(422);
    });

    test("CAT-008: 422 — missing nameGe", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { slug: uniqueSlug(), nameEn: uniqueNameEn() },
      });
      expect(res.status()).toBe(422);
    });

    test("CAT-009: 422 — missing nameEn", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { slug: uniqueSlug(), nameGe: uniqueNameGe() },
      });
      expect(res.status()).toBe(422);
    });

    test("CAT-010: 422 — slug too short (1 char)", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { slug: "a", nameGe: uniqueNameGe(), nameEn: uniqueNameEn() },
      });
      expect(res.status()).toBe(422);
    });

    test("CAT-011: [BVA min=2] 201 — slug of exactly 2 chars", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { slug: "ab", nameGe: uniqueNameGe(), nameEn: uniqueNameEn() },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      await deleteCategory(adminApi, body.data._id);
    });

    test("CAT-012: [BVA max=50] 201 — slug of exactly 50 chars", async ({ adminApi }) => {
      const slug = "a".repeat(50);
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { slug, nameGe: uniqueNameGe(), nameEn: uniqueNameEn() },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      await deleteCategory(adminApi, body.data._id);
    });

    test("CAT-013: [BVA max+1=51] 422 — slug of 51 chars", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { slug: "a".repeat(51), nameGe: uniqueNameGe(), nameEn: uniqueNameEn() },
      });
      expect(res.status()).toBe(422);
    });

    test("CAT-014: [BVA min=2] 201 — nameGe of exactly 2 chars", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { slug: uniqueSlug(), nameGe: "ტა", nameEn: uniqueNameEn() },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      await deleteCategory(adminApi, body.data._id);
    });

    test("CAT-015: [BVA min-1=1] 422 — nameGe of 1 char", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { slug: uniqueSlug(), nameGe: "ტ", nameEn: uniqueNameEn() },
      });
      expect(res.status()).toBe(422);
    });

    test("CAT-016: [BVA max=50] 201 — nameGe of exactly 50 chars", async ({ adminApi }) => {
      const nameGe = "ტ".repeat(50);
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { slug: uniqueSlug(), nameGe, nameEn: uniqueNameEn() },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      await deleteCategory(adminApi, body.data._id);
    });

    test("CAT-017: [BVA max+1=51] 422 — nameGe of 51 chars", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { slug: uniqueSlug(), nameGe: "ტ".repeat(51), nameEn: uniqueNameEn() },
      });
      expect(res.status()).toBe(422);
    });

    test("CAT-018: 422 — nameGe with Latin chars (invalid)", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { slug: uniqueSlug(), nameGe: "Jewelry", nameEn: uniqueNameEn() },
      });
      expect(res.status()).toBe(422);
    });

    test("CAT-019: 422 — nameEn with Georgian chars (invalid)", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { slug: uniqueSlug(), nameGe: uniqueNameGe(), nameEn: "სამკაული" },
      });
      expect(res.status()).toBe(422);
    });

    test("CAT-020: 422 — slug with uppercase (must be lowercase)", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { slug: "ABC_CAT", nameGe: uniqueNameGe(), nameEn: uniqueNameEn() },
      });
      expect(res.status()).toBe(422);
    });

    test("CAT-021: 422 — slug with spaces (invalid)", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
        data: { slug: "my category", nameGe: uniqueNameGe(), nameEn: uniqueNameEn() },
      });
      expect(res.status()).toBe(422);
    });

    test("CAT-022: 422 — empty body", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, { data: {} });
      expect(res.status()).toBe(422);
    });
  });
};

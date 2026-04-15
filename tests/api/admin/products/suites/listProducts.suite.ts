import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";

export const listProductsSuites = () => {
  test.describe("1. List Products (GET /api/products)", () => {
    test("PR-001: Admin can list all products", async ({ adminApi }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    });

    test("PR-002: Admin can list products with limit/page", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { limit: 5, page: 1 },
      });
      expect(res.status()).toBe(200);
      // Note: Full pagination testing requires a known number of products
    });

    test("PR-003: Admin can search products by title or description", async ({
      adminApi,
    }) => {
      const term = "Test";
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { search: term },
      });
      expect(res.status()).toBe(200);
      const products = await res.json();
      if (products.length > 0) {
        const item = products[0];
        const combinedText =
          `${item.titleGe}${item.titleEn}${item.descriptionGe}${item.descriptionEn}`.toLowerCase();
        expect(combinedText).toContain(term.toLowerCase());
      }
    });

    test("PR-004: Admin can filter products by category", async ({
      adminApi,
    }) => {
      const category = "jewelry_accessories";
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { category },
      });
      expect(res.status()).toBe(200);
      const products = await res.json();
      products.forEach((p: any) => expect(p.category).toBe(category));
    });

    test("PR-005: Admin can filter products by partnerId", async ({
      adminApi,
    }) => {
      const partnerId = process.env.ORGANIZER_PARTNER_ID;
      if (partnerId) {
        const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
          params: { partnerId },
        });
        expect(res.status()).toBe(200);
        const products = await res.json();
        products.forEach((p: any) => expect(p.owner).toBe(partnerId));
      }
    });

    test("PR-006: Partner can list their own products via /partner/:id", async ({
      partnerApi,
      partnerUser,
    }) => {
      const res = await partnerApi.get(
        `${ENDPOINTS.ADMIN_PRODUCTS}/partner/${partnerUser.id}`,
      );
      expect(res.status()).toBe(200);
      const data = await res.json();
      data.forEach((p: any) => expect(p.owner).toBe(partnerUser.id));
    });

    test("PR-007: Partner cannot list products of another partner via /partner/:id (Access Isolation)", async ({
      partnerApi,
    }) => {
      const anotherPartnerId = "67f123456789012345678901";
      const res = await partnerApi.get(
        `${ENDPOINTS.ADMIN_PRODUCTS}/partner/${anotherPartnerId}`,
      );
      expect(res.status()).toBe(403);
    });

    test("PR-008: 422/404 on list products with invalid partner ID format", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_PRODUCTS}/partner/invalid-id`,
      );
      expect([400, 422, 404]).toContain(res.status());
    });
  });
};

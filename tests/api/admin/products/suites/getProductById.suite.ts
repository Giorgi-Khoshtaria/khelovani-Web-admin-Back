import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createTestProduct, cleanupProduct } from "../products.helpers.js";

export const getProductByIdSuites = () => {
  test.describe("2. Get Product By ID (GET /api/products/:productId)", () => {
    let testProductId: string;
    const partnerId = process.env.ORGANIZER_PARTNER_ID!;

    test.beforeEach(async ({ adminApi }) => {
      const product = await createTestProduct(adminApi, partnerId);
      testProductId = product._id;
    });

    test.afterEach(async ({ adminApi }) => {
      if (testProductId) {
        await cleanupProduct(adminApi, testProductId);
      }
    });

    test("PR-010: Admin can get product details by ID", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_PRODUCTS}/${testProductId}`,
      );
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body._id).toBe(testProductId);
    });

    test("PR-011: Partner can get their own product details by ID", async ({
      partnerApi,
      partnerUser,
    }) => {
      const myProduct = await createTestProduct(partnerApi, partnerUser.id!);

      const res = await partnerApi.get(
        `${ENDPOINTS.ADMIN_PRODUCTS}/${myProduct._id}`,
      );
      if (res.status() !== 200) {
        console.log("PR-011 FAILED:", await res.json());
      }
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body._id).toBe(myProduct._id);
    });

    test("PR-012: 404 — Product not found (invalid but valid length ID)", async ({
      adminApi,
    }) => {
      const nonExistentId = "67f123456789012345678901";
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_PRODUCTS}/${nonExistentId}`,
      );
      expect(res.status()).toBe(404);
    });

    test("PR-013: 400 — Invalid product ID format", async ({ adminApi }) => {
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_PRODUCTS}/invalid-id`);
      expect(res.status()).toBe(422);
    });

    test("PR-014: Partner cannot get another partner's product details (Access Isolation)", async ({
      partnerApi,
    }) => {
      // testProductId was created for process.env.ORGANIZER_PARTNER_ID, not the partnerUser
      const res = await partnerApi.get(
        `${ENDPOINTS.ADMIN_PRODUCTS}/${testProductId}`,
      );
      expect(res.status()).toBe(403);
    });
  });
};

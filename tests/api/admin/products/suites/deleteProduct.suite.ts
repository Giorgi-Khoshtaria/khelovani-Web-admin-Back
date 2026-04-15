import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createTestProduct, cleanupProduct } from "../products.helpers.js";

export const deleteProductSuites = () => {
  test.describe("5. Delete Product (DELETE /api/products/:productId)", () => {
    let testProductId: string;
    const partnerId = process.env.ORGANIZER_PARTNER_ID!;

    test.beforeEach(async ({ adminApi }) => {
      const product = await createTestProduct(adminApi, partnerId);
      testProductId = product._id;
    });

    test("PR-050: Admin can delete a product", async ({ adminApi }) => {
      const res = await adminApi.delete(
        `${ENDPOINTS.ADMIN_PRODUCTS}/${testProductId}`,
      );
      expect(res.status()).toBe(200);

      // Verify it's gone
      const checkRes = await adminApi.get(
        `${ENDPOINTS.ADMIN_PRODUCTS}/${testProductId}`,
      );
      expect(checkRes.status()).toBe(404);
    });

    test("PR-051: Partner can delete their own product", async ({
      partnerApi,
      partnerUser,
    }) => {
      const myProduct = await createTestProduct(partnerApi, partnerUser.id!);

      const res = await partnerApi.delete(
        `${ENDPOINTS.ADMIN_PRODUCTS}/${myProduct._id}`,
      );
      expect(res.status()).toBe(200);
    });

    test("PR-052: 404 — Delete non-existent product", async ({ adminApi }) => {
      const nonExistentId = "67f123456789012345678901";
      const res = await adminApi.delete(
        `${ENDPOINTS.ADMIN_PRODUCTS}/${nonExistentId}`,
      );
      expect(res.status()).toBe(404);
    });

    test("PR-053: 400 — Invalid product ID format on delete", async ({
      adminApi,
    }) => {
      const res = await adminApi.delete(
        `${ENDPOINTS.ADMIN_PRODUCTS}/invalid-id`,
      );
      expect(res.status()).toBe(422);
    });
  });
};

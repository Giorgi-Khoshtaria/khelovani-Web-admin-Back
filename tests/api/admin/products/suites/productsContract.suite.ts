import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createTestProduct, cleanupProduct } from "../products.helpers.js";

export const productsContractSuites = () => {
  test.describe("7. Response Contract (GET /api/admin/products)", () => {
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

    test("PR-080: Product detail matches the full expected schema", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_PRODUCTS}/${testProductId}`,
      );
      const body = await res.json();

      const expectedFields = [
        "_id",
        "titleGe",
        "titleEn",
        "descriptionGe",
        "descriptionEn",
        "price",
        "category",
        "owner",
        "images",
        "stockQuantity",
        "condition",
        "tagsGe",
        "tagsEn",
        "materialsGe",
        "materialsEn",
        "shippingAvailable",
        "shippingPrice",
        "locationGe",
        "locationEn",
        "weight",
        "isShown",
        "isOneOfAKind",
        "createdAt",
        "updatedAt",
      ];

      expectedFields.forEach((field) => {
        expect(body).toHaveProperty(field);
      });

      expect(Array.isArray(body.images)).toBe(true);
      expect(Array.isArray(body.tagsGe)).toBe(true);

      // Sensitive or internal fields check
      expect(body).not.toHaveProperty("__v");
    });

    test("PR-081: Product list items match the essential schema", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS);
      const list = await res.json();

      if (list.length > 0) {
        const item = list[0];
        ["_id", "titleGe", "price", "owner", "images"].forEach((f) => {
          expect(item).toHaveProperty(f);
        });
      }
    });
  });
};

import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createTestProduct, cleanupProduct } from "../products.helpers.js";

export const productsContractSuites = () => {
  test.describe("7. Response Contract", () => {
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

    test("PR-080: Product detail — full expected schema present", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_PRODUCTS}/${testProductId}`,
      );
      expect(res.status()).toBe(200);
      const body = await res.json();

      // Top-level envelope
      expect(body).toHaveProperty("success", true);
      expect(body).toHaveProperty("message");
      expect(body).toHaveProperty("data");

      const product = body.data;
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

      expectedFields.forEach((field) => expect(product).toHaveProperty(field));
      expect(Array.isArray(product.images)).toBe(true);
      expect(Array.isArray(product.tagsGe)).toBe(true);
      expect(product).not.toHaveProperty("__v");
    });

    test("PR-081: Product list — envelope and essential item fields present", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS);
      expect(res.status()).toBe(200);
      const body = await res.json();

      // Envelope
      expect(body).toHaveProperty("success", true);
      expect(body).toHaveProperty("data");
      expect(Array.isArray(body.data)).toBe(true);

      // Meta shape
      expect(body).toHaveProperty("meta");
      expect(body.meta).toHaveProperty("total");
      expect(body.meta).toHaveProperty("page");
      expect(body.meta).toHaveProperty("limit");
      expect(body.meta).toHaveProperty("totalPages");

      if (body.data.length > 0) {
        const item = body.data[0];
        ["_id", "titleGe", "titleEn", "price", "owner", "images"].forEach(
          (f) => {
            expect(item).toHaveProperty(f);
          },
        );
        expect(item).not.toHaveProperty("__v");
      }
    });

    test("PR-082: Search meta — search term echoed back in meta when provided", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { search: "test" },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.meta).toHaveProperty("search", "test");
    });

    test("PR-083: totalPages is consistent with total and limit", async ({
      adminApi,
    }) => {
      const limit = 5;
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { limit },
      });
      expect(res.status()).toBe(200);
      const { meta } = await res.json();
      expect(meta.totalPages).toBe(Math.ceil(meta.total / meta.limit));
    });
  });
};

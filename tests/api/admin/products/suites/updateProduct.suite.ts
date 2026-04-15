import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createTestProduct, cleanupProduct } from "../products.helpers.js";
import fs from "fs";
import path from "path";

export const updateProductSuites = () => {
  test.describe("4. Update Product (PUT /api/products/:productId)", () => {
    let testProductId: string;
    const partnerId = process.env.ORGANIZER_PARTNER_ID!;
    const dummyImage = fs.readFileSync(
      path.join(process.cwd(), "tests/helpers/assets/5LiAN.jpg"),
    );

    test.beforeEach(async ({ adminApi }) => {
      const product = await createTestProduct(adminApi, partnerId);
      testProductId = product._id;
    });

    test.afterEach(async ({ adminApi }) => {
      if (testProductId) {
        await cleanupProduct(adminApi, testProductId);
      }
    });

    const putMultipart = async (
      api: any,
      productId: string,
      data: any,
      image: any = null,
    ) => {
      const formData: any = {};
      for (const [key, value] of Object.entries(data)) {
        formData[key] =
          Array.isArray(value) || typeof value === "object"
            ? JSON.stringify(value)
            : String(value);
      }

      const multipart: any = { ...formData };
      if (image) {
        multipart.images = {
          name: "updated.jpg",
          mimeType: "image/jpeg",
          buffer: image,
        };
      }

      return await api.put(`${ENDPOINTS.ADMIN_PRODUCTS}/${productId}`, {
        multipart,
      });
    };

    test("PR-040: Admin can update all fields of a product", async ({
      adminApi,
    }) => {
      const updateData = { titleGe: "განახლებული სათაური", price: 99.99 };
      const res = await putMultipart(adminApi, testProductId, updateData);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.product.titleGe).toBe(updateData.titleGe);
      expect(body.product.price).toBe(updateData.price);
    });

    test("PR-041: Partner can update their own product", async ({
      partnerApi,
      partnerUser,
    }) => {
      const myProduct = await createTestProduct(partnerApi, partnerUser.id!);

      const updateData = { descriptionEn: "Updated description" };
      const res = await putMultipart(partnerApi, myProduct._id, updateData);
      expect(res.status()).toBe(200);
    });

    /**
     * ============================================================
     *  FIELD VALIDATIONS ON UPDATE
     * ============================================================
     */

    const validationTests = [
      {
        id: "PR-042",
        field: "price",
        value: -5,
        desc: "price: Cannot be negative",
      },
      {
        id: "PR-043",
        field: "stockQuantity",
        value: "invalid",
        desc: "stockQuantity: Must be a number",
      },
      {
        id: "PR-044",
        field: "condition",
        value: "used",
        desc: "condition: Invalid enum",
      },
      {
        id: "PR-045",
        field: "titleGe",
        value: "Wrong English",
        desc: "titleGe: Regex mismatch",
      },
    ];

    for (const t of validationTests) {
      test(`${t.id}: 422 — Validation on update: ${t.desc}`, async ({
        adminApi,
      }) => {
        const res = await putMultipart(adminApi, testProductId, {
          [t.field]: t.value,
        });
        expect(res.status()).toBe(422);
      });
    }

    test("PR-046: 404 — Update non-existent product", async ({ adminApi }) => {
      const nonExistentId = "67f123456789012345678901";
      const res = await putMultipart(adminApi, nonExistentId, {
        titleGe: "ტესტ",
      });
      expect(res.status()).toBe(404);
    });

    test("PR-047: Admin can add more images during update", async ({
      adminApi,
    }) => {
      const res = await putMultipart(adminApi, testProductId, {}, dummyImage);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.product.images.length).toBeGreaterThan(0);
    });
  });
};

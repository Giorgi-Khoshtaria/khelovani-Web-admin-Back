import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { getTestProductData } from "../products.helpers.js";
import fs from "fs";
import path from "path";

export const createProductSuites = () => {
  test.describe("3. Create Product (POST /api/products/partner/:id)", () => {
    const partnerId = process.env.ORGANIZER_PARTNER_ID!;

    // Use an actual tested image asset to avoid Cloudinary format errors
    const dummyImage = fs.readFileSync(
      path.join(process.cwd(), "tests/helpers/assets/3ADDP.jpg"),
    );

    const postMultipart = async (
      api: any,
      pId: string,
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
          name: "test.jpg",
          mimeType: "image/jpeg",
          buffer: image,
        };
      }

      return await api.post(`${ENDPOINTS.ADMIN_PRODUCTS}/partner/${pId}`, {
        multipart,
      });
    };

    test("PR-020: Admin can create a valid product for a partner", async ({
      adminApi,
    }) => {
      const data = getTestProductData();
      const res = await postMultipart(adminApi, partnerId, data, dummyImage);
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.data.titleGe).toBe(data.titleGe);
      expect(body.data.owner).toBe(partnerId);
    });

    test("PR-021: Partner can create a product for themselves", async ({
      partnerApi,
      partnerUser,
    }) => {
      const data = getTestProductData();
      const res = await postMultipart(
        partnerApi,
        partnerUser.id!,
        data,
        dummyImage,
      );
      expect(res.status()).toBe(201);
    });

    /**
     * ============================================================
     *  FIELD VALIDATIONS (MAXIMUM COVERAGE)
     * ============================================================
     */

    const validationTests = [
      {
        id: "PR-022",
        field: "titleGe",
        value: "",
        desc: "Missing required titleGe",
      },
      {
        id: "PR-023",
        field: "titleGe",
        value: "English Title",
        desc: "titleGe: No English letters allowed",
      },
      {
        id: "PR-024",
        field: "titleEn",
        value: "",
        desc: "Missing required titleEn",
      },
      {
        id: "PR-025",
        field: "titleEn",
        value: "ტესტ",
        desc: "titleEn: No Georgian letters allowed",
      },
      {
        id: "PR-026",
        field: "descriptionGe",
        value: "მოკლე",
        desc: "descriptionGe: Too short (<10)",
      },
      {
        id: "PR-027",
        field: "descriptionEn",
        value: "Short",
        desc: "descriptionEn: Too short (<10)",
      },
      {
        id: "PR-028",
        field: "price",
        value: -10,
        desc: "price: Must be positive",
      },
      {
        id: "PR-029",
        field: "price",
        value: "not-a-number",
        desc: "price: Must be a number",
      },
      {
        id: "PR-030",
        field: "category",
        value: "",
        desc: "category: Must not be empty",
      },
      {
        id: "PR-031",
        field: "stockQuantity",
        value: -1,
        desc: "stockQuantity: Cannot be negative",
      },
      {
        id: "PR-032",
        field: "tagsGe",
        value: [],
        desc: "tagsGe: At least 1 item required",
      },
      {
        id: "PR-033",
        field: "tagsGe",
        value: ["ა"],
        desc: "tagsGe item: Too short (<3)",
      },
      {
        id: "PR-034",
        field: "condition",
        value: "old",
        desc: "condition: Must be valid enum",
      },
      {
        id: "PR-035",
        field: "weight",
        value: 0,
        desc: "weight: Must be positive",
      },
      {
        id: "PR-036",
        field: "shippingPrice",
        value: -5,
        desc: "shippingPrice: Cannot be negative",
      },
      {
        id: "PR-037",
        field: "locationGe",
        value: "A",
        desc: "locationGe: Too short or wrong regex",
      },
    ];

    for (const t of validationTests) {
      test(`${t.id}: 422 — Validation: ${t.desc}`, async ({ adminApi }) => {
        const data = getTestProductData({ [t.field]: t.value });
        const res = await postMultipart(adminApi, partnerId, data, dummyImage);
        if (res.status() !== 422) {
          console.log(
            `Failed for ${t.id}`,
            await res.json().catch(() => "no json"),
          );
        }
        expect(res.status()).toBe(422);
        const body = await res.json();
        const hasField = body.errors.some(
          (e: any) => e.field === t.field || e.field.startsWith(`${t.field}.`),
        );
        expect(hasField).toBe(true);
      });
    }

    test("PR-038: 400 — Images are required for creation", async ({
      adminApi,
    }) => {
      const data = getTestProductData();
      const res = await postMultipart(adminApi, partnerId, data, null);
      expect(res.status()).toBe(422);
    });

    test("PR-039: 403 — Partner cannot create product for another partner", async ({
      partnerApi,
    }) => {
      const anotherPartnerId = "67f123456789012345678901";
      const data = getTestProductData();
      const res = await postMultipart(
        partnerApi,
        anotherPartnerId,
        data,
        dummyImage,
      );
      expect(res.status()).toBe(403);
    });
  });
};

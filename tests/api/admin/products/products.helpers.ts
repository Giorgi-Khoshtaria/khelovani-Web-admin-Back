import { APIRequestContext } from "@playwright/test";
import { ENDPOINTS } from "../../../constants/endpoints.js";
import { randomId } from "../../../helpers/utils/generators.js";
import fs from "fs";
import path from "path";

/**
 * Returns a valid product data object for testing.
 */
export const getTestProductData = (overrides = {}) => {
  return {
    titleGe: `ტესტ პროდუქტი ${randomId()}`,
    titleEn: `Test Product ${randomId()}`,
    descriptionGe: "ეს არის ტესტ პროდუქტის აღწერა მინიმუმ 10 სიმბოლო",
    descriptionEn: "This is a test product description at least 10 chars",
    category: "jewelry_accessories",
    price: 15.5,
    stockQuantity: 10,
    condition: "handmade",
    tagsGe: ["ტეგი1", "ტეგი2"],
    tagsEn: ["tag1", "tag2"],
    materialsGe: ["მასალა1", "მასალა2"],
    materialsEn: ["material1", "material2"],
    shippingAvailable: true,
    shippingPrice: 5,
    locationGe: "თბილისი",
    locationEn: "Tbilisi",
    weight: 0.5,
    isShown: true,
    isOneOfAKind: false,
    ...overrides,
  };
};

/**
 * Creates a product for a specific partner using multipart/form-data.
 */
export async function createTestProduct(
  api: APIRequestContext,
  partnerId: string,
  overrides = {}
) {
  const data = getTestProductData(overrides);
  
  // Use actual tested asset instead of buffer
  const dummyImage = fs.readFileSync(path.join(process.cwd(), "tests/helpers/assets/eocB2.jpg"));

  const formData: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      formData[key] = JSON.stringify(value);
    } else {
      formData[key] = String(value);
    }
  }

  const res = await api.post(`${ENDPOINTS.ADMIN_PRODUCTS}/partner/${partnerId}`, {
    multipart: {
      ...formData,
      images: {
        name: "test-product.jpg",
        mimeType: "image/jpeg",
        buffer: dummyImage,
      },
    },
  });

  if (res.status() !== 201) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(`createTestProduct failed (${res.status()}): ${JSON.stringify(errorBody)}`);
  }

  const body = await res.json();
  return body.product;
}

/**
 * Deletes a product by ID.
 */
export async function cleanupProduct(api: APIRequestContext, productId: string) {
  const res = await api.delete(`${ENDPOINTS.ADMIN_PRODUCTS}/${productId}`);
  return res;
}

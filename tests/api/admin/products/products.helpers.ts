import { APIRequestContext } from "@playwright/test";
import { ENDPOINTS } from "../../../constants/endpoints.js";
import { randomId } from "../../../helpers/utils/generators.js";

import fs from "fs";
import path from "path";

// Seeded slug list used as fallback if DB fetch hasn't run yet
const FALLBACK_CATEGORIES = [
  "jewelry", "ceramics", "textile", "woodwork", "painting",
  "sculpture", "leatherwork", "glasswork", "embroidery", "metalwork",
  "feltwork", "knitting", "candles", "photography", "printmaking",
  "paper_art", "home_decor", "accessories", "toys", "other",
];

let activeSlugs: string[] = [...FALLBACK_CATEGORIES];
let categoryIndex = 0;

/**
 * Fetches active category slugs from the DB and caches them.
 * Call once in a test.beforeAll so all suites use real seeded data.
 */
export async function loadCategorySlugs(api: APIRequestContext): Promise<void> {
  try {
    const res = await api.get(ENDPOINTS.PUBLIC_CATEGORIES);
    if (res.status() === 200) {
      const body = await res.json();
      const slugs: string[] = (body.data as any[]).map((c) => c.slug).filter(Boolean);
      if (slugs.length > 0) {
        activeSlugs = slugs;
        categoryIndex = 0;
      }
    }
  } catch {
    // fallback list stays in place
  }
}

/** Cycles through active category slugs on each call. */
export const nextCategory = (): string =>
  activeSlugs[categoryIndex++ % activeSlugs.length];

/**
 * Returns a valid product data object for testing.
 * Category rotates through all valid slugs unless overridden.
 */
export const getTestProductData = (overrides: Record<string, any> = {}) => {
  return {
    titleGe: `ტესტ პროდუქტი ${randomId()}`,
    titleEn: `Test Product ${randomId()}`,
    descriptionGe: "ეს არის ტესტ პროდუქტის აღწერა მინიმუმ 10 სიმბოლო",
    descriptionEn: "This is a test product description at least 10 chars",
    category: nextCategory(),
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
    isShown: false,
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
  overrides = {},
) {
  const data = getTestProductData(overrides);

  const dummyImage = fs.readFileSync(
    path.join(process.cwd(), "tests/helpers/assets/eocB2.jpg"),
  );

  const formData: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      formData[key] = JSON.stringify(value);
    } else {
      formData[key] = String(value);
    }
  }

  const res = await api.post(
    `${ENDPOINTS.ADMIN_PRODUCTS}/partner/${partnerId}`,
    {
      multipart: {
        ...formData,
        images: {
          name: "test-product.jpg",
          mimeType: "image/jpeg",
          buffer: dummyImage,
        },
      },
    },
  );

  if (res.status() !== 201) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      `createTestProduct failed (${res.status()}): ${JSON.stringify(errorBody)}`,
    );
  }

  const body = await res.json();
  return body.data;
}

/**
 * Deletes a product by ID.
 */
export async function cleanupProduct(
  api: APIRequestContext,
  productId: string,
) {
  const res = await api.delete(`${ENDPOINTS.ADMIN_PRODUCTS}/${productId}`);
  return res;
}

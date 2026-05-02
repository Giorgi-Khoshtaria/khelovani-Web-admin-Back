import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { getTestProductData } from "../products.helpers.js";
import {
  productTitleGeScenarios,
  productTitleEnScenarios,
  productPriceScenarios,
  productStockScenarios,
  productConditionScenarios,
  LIMITS,
} from "../../../../helpers/shared/validation.helper.js";
import fs from "fs";
import path from "path";

export const productValidationSuites = () => {
  test.describe("8. Product Field Validation", () => {
    const partnerId = process.env.ORGANIZER_PARTNER_ID!;

    const dummyImage = fs.readFileSync(
      path.join(process.cwd(), "tests/helpers/assets/3ADDP.jpg"),
    );

    const postProduct = async (api: any, overrides: Record<string, any>) => {
      const data = getTestProductData(overrides);
      const formData: any = {};
      for (const [key, value] of Object.entries(data)) {
        formData[key] = Array.isArray(value) ? JSON.stringify(value) : String(value);
      }
      return api.post(`${ENDPOINTS.ADMIN_PRODUCTS}/partner/${partnerId}`, {
        multipart: {
          ...formData,
          images: { name: "test.jpg", mimeType: "image/jpeg", buffer: dummyImage },
        },
      });
    };

    // ── titleGe ───────────────────────────────────────────────────────
    test.describe("titleGe field", () => {
      for (const { id, value, note } of productTitleGeScenarios) {
        test(`${id}: 422 — titleGe: ${note}`, async ({ adminApi }) => {
          const res = await postProduct(adminApi, { titleGe: value });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(body.errors.some((e: any) => e.field === "titleGe")).toBe(true);
        });
      }

      test("PRD-VAL-020: 201 — titleGe at min boundary (3 chars)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { titleGe: "ტეს" });
        expect(res.status()).toBe(201);
      });

      test("PRD-VAL-021: 201 — titleGe at max boundary (100 chars)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { titleGe: "ა".repeat(LIMITS.product.titleGe.max) });
        expect(res.status()).toBe(201);
      });
    });

    // ── titleEn ───────────────────────────────────────────────────────
    test.describe("titleEn field", () => {
      for (const { id, value, note } of productTitleEnScenarios) {
        test(`${id}: 422 — titleEn: ${note}`, async ({ adminApi }) => {
          const res = await postProduct(adminApi, { titleEn: value });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(body.errors.some((e: any) => e.field === "titleEn")).toBe(true);
        });
      }

      test("PRD-VAL-022: 201 — titleEn at min boundary (3 chars)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { titleEn: "ABC" });
        expect(res.status()).toBe(201);
      });

      test("PRD-VAL-023: 201 — titleEn at max boundary (100 chars)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { titleEn: "A".repeat(LIMITS.product.titleEn.max) });
        expect(res.status()).toBe(201);
      });
    });

    // ── price ─────────────────────────────────────────────────────────
    test.describe("price field", () => {
      for (const { id, value, note } of productPriceScenarios) {
        test(`${id}: 422 — price: ${note}`, async ({ adminApi }) => {
          const res = await postProduct(adminApi, { price: value });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(body.errors.some((e: any) => e.field === "price")).toBe(true);
        });
      }

      test("PRD-VAL-024: 422 — price missing", async ({ adminApi }) => {
        const data = getTestProductData();
        const { price, ...noPriceData } = data;
        const formData: any = {};
        for (const [key, value] of Object.entries(noPriceData)) {
          formData[key] = Array.isArray(value) ? JSON.stringify(value) : String(value);
        }
        const res = await adminApi.post(`${ENDPOINTS.ADMIN_PRODUCTS}/partner/${partnerId}`, {
          multipart: { ...formData, images: { name: "test.jpg", mimeType: "image/jpeg", buffer: dummyImage } },
        });
        expect(res.status()).toBe(422);
      });
    });

    // ── stockQuantity ─────────────────────────────────────────────────
    test.describe("stockQuantity field", () => {
      for (const { id, value, note } of productStockScenarios) {
        test(`${id}: 422 — stockQuantity: ${note}`, async ({ adminApi }) => {
          const res = await postProduct(adminApi, { stockQuantity: value });
          expect(res.status(), `${id}: ${note}`).toBe(422);
        });
      }

      test("PRD-VAL-025: 201 — stockQuantity 0 accepted (min boundary)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { stockQuantity: 0 });
        expect(res.status()).toBe(201);
      });
    });

    // ── condition ─────────────────────────────────────────────────────
    test.describe("condition field", () => {
      for (const { id, value, note } of productConditionScenarios) {
        test(`${id}: 422 — condition: ${note}`, async ({ adminApi }) => {
          const res = await postProduct(adminApi, { condition: value });
          expect(res.status(), `${id}: ${note}`).toBe(422);
        });
      }

      test("PRD-VAL-026: 201 — condition 'new' accepted", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { condition: "new" });
        expect(res.status()).toBe(201);
      });

      test("PRD-VAL-027: 201 — condition 'vintage' accepted", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { condition: "vintage" });
        expect(res.status()).toBe(201);
      });
    });

    // ── descriptionGe ─────────────────────────────────────────────────
    test.describe("descriptionGe field", () => {
      test("PRD-VAL-030: 422 — descriptionGe too short (<10 chars)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { descriptionGe: "მოკლე" });
        expect(res.status()).toBe(422);
        const body = await res.json();
        expect(body.errors.some((e: any) => e.field === "descriptionGe")).toBe(true);
      });

      test("PRD-VAL-031: 422 — descriptionGe too long (>2000 chars)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { descriptionGe: "ა".repeat(LIMITS.product.descriptionGe.max + 1) });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-032: 422 — descriptionGe contains Latin chars", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { descriptionGe: "This is English description text here" });
        expect(res.status()).toBe(422);
      });
    });

    // ── descriptionEn ─────────────────────────────────────────────────
    test.describe("descriptionEn field", () => {
      test("PRD-VAL-033: 422 — descriptionEn too short (<10 chars)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { descriptionEn: "Short" });
        expect(res.status()).toBe(422);
        const body = await res.json();
        expect(body.errors.some((e: any) => e.field === "descriptionEn")).toBe(true);
      });

      test("PRD-VAL-034: 422 — descriptionEn too long (>2000 chars)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { descriptionEn: "A".repeat(LIMITS.product.descriptionEn.max + 1) });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-035: 422 — descriptionEn contains Georgian chars", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { descriptionEn: "ეს არის ქართული ტექსტი" });
        expect(res.status()).toBe(422);
      });
    });

    // ── tags ──────────────────────────────────────────────────────────
    test.describe("tags fields", () => {
      test("PRD-VAL-040: 422 — tagsGe empty array", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { tagsGe: [] });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-041: 422 — tagsGe item too short (<3 chars)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { tagsGe: ["ა"] });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-042: 422 — tagsGe item too long (>30 chars)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { tagsGe: ["ა".repeat(LIMITS.product.tagItem.max + 1)] });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-043: 422 — tagsEn empty array", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { tagsEn: [] });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-044: 422 — tagsGe exceeds max count (>10 items)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { tagsGe: Array(LIMITS.product.tags.max + 1).fill("ტეგი") });
        expect(res.status()).toBe(422);
      });
    });

    // ── category ──────────────────────────────────────────────────────
    test.describe("category field", () => {
      test("PRD-VAL-060: 201 — category accepts any non-empty slug string", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { category: "jewelry" });
        expect(res.status()).toBe(201);
      });

      test("PRD-VAL-061: 422 — category empty string", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { category: "" });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-062: 201 — category accepts mixed case strings", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { category: "Ceramics" });
        expect(res.status()).toBe(201);
      });

      test("PRD-VAL-063: 422 — category missing", async ({ adminApi }) => {
        const data = getTestProductData();
        const { category, ...rest } = data;
        const formData: any = {};
        for (const [key, value] of Object.entries(rest)) {
          formData[key] = Array.isArray(value) ? JSON.stringify(value) : String(value);
        }
        const res = await adminApi.post(`${ENDPOINTS.ADMIN_PRODUCTS}/partner/${partnerId}`, {
          multipart: { ...formData, images: { name: "test.jpg", mimeType: "image/jpeg", buffer: dummyImage } },
        });
        expect(res.status()).toBe(422);
      });
    });

    // ── materialsGe ───────────────────────────────────────────────────
    test.describe("materialsGe field", () => {
      test("PRD-VAL-070: 422 — materialsGe empty array", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { materialsGe: [] });
        expect(res.status()).toBe(422);
        const body = await res.json();
        expect(body.errors.some((e: any) => e.field.startsWith("materialsGe"))).toBe(true);
      });

      test("PRD-VAL-071: 422 — materialsGe item too short (<3 chars)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { materialsGe: ["ა"] });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-072: 422 — materialsGe item too long (>30 chars)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { materialsGe: ["ა".repeat(31)] });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-073: 422 — materialsGe item contains Latin chars", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { materialsGe: ["wood"] });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-074: 422 — materialsGe exceeds max count (>10)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { materialsGe: Array(11).fill("ხეტყე") });
        expect(res.status()).toBe(422);
      });
    });

    // ── materialsEn ───────────────────────────────────────────────────
    test.describe("materialsEn field", () => {
      test("PRD-VAL-075: 422 — materialsEn empty array", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { materialsEn: [] });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-076: 422 — materialsEn item too short (<3 chars)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { materialsEn: ["AB"] });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-077: 422 — materialsEn item too long (>30 chars)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { materialsEn: ["A".repeat(31)] });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-078: 422 — materialsEn item contains Georgian chars", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { materialsEn: ["ხეტყე"] });
        expect(res.status()).toBe(422);
      });
    });

    // ── locationGe (optional) ─────────────────────────────────────────
    test.describe("locationGe field (optional)", () => {
      test("PRD-VAL-080: 422 — locationGe too short (1 char)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { locationGe: "ა" });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-081: 422 — locationGe too long (>100 chars)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { locationGe: "ა".repeat(101) });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-082: 422 — locationGe contains Latin chars", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { locationGe: "Tbilisi" });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-083: 201 — locationGe omitted (optional)", async ({ adminApi }) => {
        const data = getTestProductData();
        const { locationGe, ...rest } = data;
        const formData: any = {};
        for (const [key, value] of Object.entries(rest)) {
          formData[key] = Array.isArray(value) ? JSON.stringify(value) : String(value);
        }
        const res = await adminApi.post(`${ENDPOINTS.ADMIN_PRODUCTS}/partner/${partnerId}`, {
          multipart: { ...formData, images: { name: "test.jpg", mimeType: "image/jpeg", buffer: dummyImage } },
        });
        expect(res.status()).toBe(201);
      });
    });

    // ── locationEn (optional) ─────────────────────────────────────────
    test.describe("locationEn field (optional)", () => {
      test("PRD-VAL-084: 422 — locationEn too short (1 char)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { locationEn: "A" });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-085: 422 — locationEn too long (>100 chars)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { locationEn: "A".repeat(101) });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-086: 422 — locationEn contains Georgian chars", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { locationEn: "თბილისი" });
        expect(res.status()).toBe(422);
      });
    });

    // ── weight (optional) ─────────────────────────────────────────────
    test.describe("weight field (optional)", () => {
      test("PRD-VAL-090: 422 — weight is zero (must be positive)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { weight: 0 });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-091: 422 — weight is negative", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { weight: -1 });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-092: 422 — weight is string", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { weight: "heavy" });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-093: 201 — weight omitted (optional)", async ({ adminApi }) => {
        const data = getTestProductData();
        const { weight, ...rest } = data;
        const formData: any = {};
        for (const [key, value] of Object.entries(rest)) {
          formData[key] = Array.isArray(value) ? JSON.stringify(value) : String(value);
        }
        const res = await adminApi.post(`${ENDPOINTS.ADMIN_PRODUCTS}/partner/${partnerId}`, {
          multipart: { ...formData, images: { name: "test.jpg", mimeType: "image/jpeg", buffer: dummyImage } },
        });
        expect(res.status()).toBe(201);
      });
    });

    // ── shippingPrice (optional) ──────────────────────────────────────
    test.describe("shippingPrice field (optional)", () => {
      test("PRD-VAL-095: 422 — shippingPrice is negative", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { shippingPrice: -5 });
        expect(res.status()).toBe(422);
      });

      test("PRD-VAL-096: 201 — shippingPrice is 0 (boundary)", async ({ adminApi }) => {
        const res = await postProduct(adminApi, { shippingPrice: 0 });
        expect(res.status()).toBe(201);
      });

      test("PRD-VAL-097: 201 — shippingPrice omitted (optional)", async ({ adminApi }) => {
        const data = getTestProductData();
        const { shippingPrice, ...rest } = data;
        const formData: any = {};
        for (const [key, value] of Object.entries(rest)) {
          formData[key] = Array.isArray(value) ? JSON.stringify(value) : String(value);
        }
        const res = await adminApi.post(`${ENDPOINTS.ADMIN_PRODUCTS}/partner/${partnerId}`, {
          multipart: { ...formData, images: { name: "test.jpg", mimeType: "image/jpeg", buffer: dummyImage } },
        });
        expect(res.status()).toBe(201);
      });
    });

    // ── boolean fields ────────────────────────────────────────────────
    // Note: in multipart/form-data "true"/"false" are coerced to booleans server-side.
    // Only unrecognized strings and non-boolean numbers reliably fail.
    test.describe("boolean fields (shippingAvailable, isShown, isOneOfAKind)", () => {
      for (const field of ["shippingAvailable", "isShown", "isOneOfAKind"] as const) {
        test(`PRD-VAL-100 (${field}): 422 — ${field} is unrecognized string 'maybe'`, async ({ adminApi }) => {
          const res = await postProduct(adminApi, { [field]: "maybe" });
          expect(res.status()).toBe(422);
        });

        test(`PRD-VAL-101 (${field}): 422 — ${field} is number 1`, async ({ adminApi }) => {
          const res = await postProduct(adminApi, { [field]: 1 });
          expect(res.status()).toBe(422);
        });
      }
    });

    // ── strict mode ───────────────────────────────────────────────────
    test("PRD-VAL-110: 422 — unknown field rejected (strict mode)", async ({ adminApi }) => {
      const res = await postProduct(adminApi, { unknownField: "value" });
      expect(res.status()).toBe(422);
    });

    // ── image required ────────────────────────────────────────────────
    test("PRD-VAL-120: 422 — no image provided", async ({ adminApi }) => {
      const data = getTestProductData();
      const formData: any = {};
      for (const [key, value] of Object.entries(data)) {
        formData[key] = Array.isArray(value) ? JSON.stringify(value) : String(value);
      }
      const res = await adminApi.post(`${ENDPOINTS.ADMIN_PRODUCTS}/partner/${partnerId}`, {
        multipart: formData,
      });
      expect(res.status()).toBe(422);
    });
  });
};

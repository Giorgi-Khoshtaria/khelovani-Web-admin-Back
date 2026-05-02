import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createTestProduct, cleanupProduct } from "../products.helpers.js";
import { createPendingPartner, approvePartner } from "../../partners/partners.helpers.js";
import { DbHelper } from "../../../../helpers/db/db.helper.js";

async function pinProduct(api: any, productId: string, isPinned: boolean) {
  return api.patch(`${ENDPOINTS.ADMIN_PRODUCTS}/${productId}/pin`, {
    data: { isPinned },
  });
}

export const pinProductSuites = () => {
  test.describe("Pin Product — PATCH /:productId/pin", () => {
    let partnerId: string;
    let createdProductIds: string[] = [];
    let createdPartnerIds: string[] = [];

    test.beforeAll(async ({ adminApi, api }) => {
      const { id } = await createPendingPartner(api);
      partnerId = id;
      createdPartnerIds.push(id);
      await approvePartner(adminApi, id);
    });

    test.afterAll(async () => {
      for (const id of createdPartnerIds) {
        await DbHelper.deletePartnerById(id).catch(() => {});
      }
    });

    test.afterEach(async ({ adminApi }) => {
      for (const id of createdProductIds) {
        await cleanupProduct(adminApi, id).catch(() => {});
      }
      createdProductIds = [];
    });

    test("PP-PPIN-001: pin sets isPinned=true and pinnedAt, evicted is empty", async ({ adminApi }) => {
      const product = await createTestProduct(adminApi, partnerId);
      createdProductIds.push(product._id);

      const res = await pinProduct(adminApi, product._id, true);
      expect(res.status()).toBe(200);

      const body = await res.json();
      expect(body.data.isPinned).toBe(true);
      expect(body.data.pinnedAt).not.toBeNull();
      expect(body.meta.evicted).toEqual([]);
    });

    test("PP-PPIN-002: unpin sets isPinned=false and pinnedAt=null", async ({ adminApi }) => {
      const product = await createTestProduct(adminApi, partnerId);
      createdProductIds.push(product._id);
      await pinProduct(adminApi, product._id, true);

      const res = await pinProduct(adminApi, product._id, false);
      expect(res.status()).toBe(200);

      const body = await res.json();
      expect(body.data.isPinned).toBe(false);
      expect(body.data.pinnedAt).toBeNull();
      expect(body.meta.evicted).toEqual([]);
    });

    test("PP-PPIN-003: re-pinning already-pinned product is idempotent — pinnedAt unchanged, no eviction", async ({ adminApi }) => {
      const product = await createTestProduct(adminApi, partnerId);
      createdProductIds.push(product._id);
      const firstBody = await (await pinProduct(adminApi, product._id, true)).json();
      const firstPinnedAt = firstBody.data.pinnedAt;

      const res = await pinProduct(adminApi, product._id, true);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.pinnedAt).toBe(firstPinnedAt);
      expect(body.meta.evicted).toEqual([]);
    });

    test("PP-PPIN-004: 5th pin evicts the oldest (FIFO by pinnedAt asc)", async ({ adminApi }) => {
      const products: any[] = [];
      for (let i = 0; i < 5; i++) {
        const p = await createTestProduct(adminApi, partnerId);
        products.push(p);
        createdProductIds.push(p._id);
        if (i < 4) {
          await pinProduct(adminApi, p._id, true);
          await new Promise((r) => setTimeout(r, 25));
        }
      }

      const res = await pinProduct(adminApi, products[4]._id, true);
      expect(res.status()).toBe(200);

      const body = await res.json();
      expect(body.data.isPinned).toBe(true);
      expect(body.meta.evicted).toHaveLength(1);
      expect(body.meta.evicted[0]).toBe(products[0]._id);
    });

    test("PP-PPIN-005: GET /api/products/pinned reflects eviction — shows new, not evicted", async ({ adminApi, api }) => {
      const products: any[] = [];
      for (let i = 0; i < 5; i++) {
        const p = await createTestProduct(adminApi, partnerId, { isShown: true });
        products.push(p);
        createdProductIds.push(p._id);
        if (i < 4) {
          await pinProduct(adminApi, p._id, true);
          await new Promise((r) => setTimeout(r, 25));
        }
      }
      await pinProduct(adminApi, products[4]._id, true);

      const res = await api.get(ENDPOINTS.PRODUCT_PINNED);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.length).toBeLessThanOrEqual(4);
      expect(body.data.some((p: any) => p._id === products[0]._id)).toBe(false);
      expect(body.data.some((p: any) => p._id === products[4]._id)).toBe(true);
    });

    test("PP-PPIN-006: GET /api/products/pinned returns max 4, sorted newest pinnedAt first", async ({ adminApi, api }) => {
      const products: any[] = [];
      for (let i = 0; i < 4; i++) {
        const p = await createTestProduct(adminApi, partnerId, { isShown: true });
        products.push(p);
        createdProductIds.push(p._id);
        await pinProduct(adminApi, p._id, true);
        await new Promise((r) => setTimeout(r, 25));
      }

      const res = await api.get(ENDPOINTS.PRODUCT_PINNED);
      expect(res.status()).toBe(200);
      const body = await res.json();

      expect(body.data.length).toBeLessThanOrEqual(4);
      expect(body.data.every((p: any) => p.isPinned === true)).toBe(true);
      for (let i = 1; i < body.data.length; i++) {
        expect(new Date(body.data[i - 1].pinnedAt).getTime()).toBeGreaterThanOrEqual(
          new Date(body.data[i].pinnedAt).getTime(),
        );
      }
    });

    test("PP-PPIN-007: 404 on unknown valid ObjectId", async ({ adminApi }) => {
      const res = await pinProduct(adminApi, "000000000000000000000000", true);
      expect(res.status()).toBe(404);
    });

    test("PP-PPIN-008: 422 on invalid ObjectId format", async ({ adminApi }) => {
      const res = await pinProduct(adminApi, "not-an-id", true);
      expect(res.status()).toBe(422);
    });

    test("PP-PPIN-009: 422 on missing isPinned field", async ({ adminApi }) => {
      const product = await createTestProduct(adminApi, partnerId);
      createdProductIds.push(product._id);
      const res = await adminApi.patch(`${ENDPOINTS.ADMIN_PRODUCTS}/${product._id}/pin`, { data: {} });
      expect(res.status()).toBe(422);
    });

    test("PP-PPIN-010: 422 on non-boolean isPinned value", async ({ adminApi }) => {
      const product = await createTestProduct(adminApi, partnerId);
      createdProductIds.push(product._id);
      const res = await adminApi.patch(`${ENDPOINTS.ADMIN_PRODUCTS}/${product._id}/pin`, {
        data: { isPinned: "yes" },
      });
      expect(res.status()).toBe(422);
    });

    test("PP-PPIN-011: 403 for partner role (no PRODUCT_PIN permission)", async ({ partnerApi }) => {
      const product = await createTestProduct(partnerApi, partnerId);
      createdProductIds.push(product._id);
      const res = await partnerApi.patch(`${ENDPOINTS.ADMIN_PRODUCTS}/${product._id}/pin`, {
        data: { isPinned: true },
      });
      expect(res.status()).toBe(403);
    });

    test("PP-PPIN-012: 401 for unauthenticated request", async ({ adminApi, api }) => {
      const product = await createTestProduct(adminApi, partnerId);
      createdProductIds.push(product._id);
      const res = await api.patch(`${ENDPOINTS.ADMIN_PRODUCTS}/${product._id}/pin`, {
        data: { isPinned: true },
      });
      expect(res.status()).toBe(401);
    });
  });
};

import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";

export const listProductsSuites = () => {
  test.describe("1. List Products (GET /api/products)", () => {
    test("PR-001: Admin can list all products — response has data array and meta", async ({ adminApi }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("data");
      expect(Array.isArray(body.data)).toBe(true);
      expect(body).toHaveProperty("meta");
      expect(typeof body.meta.total).toBe("number");
      expect(typeof body.meta.page).toBe("number");
      expect(typeof body.meta.limit).toBe("number");
      expect(typeof body.meta.totalPages).toBe("number");
    });

    test("PR-002: Pagination — limit and page are reflected in meta", async ({ adminApi }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { limit: 5, page: 1 },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.meta.page).toBe(1);
      expect(body.meta.limit).toBe(5);
      expect(body.data.length).toBeLessThanOrEqual(5);
    });

    test("PR-003: Search — results contain the search term", async ({ adminApi }) => {
      const term = "Test";
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { search: term },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.meta).toHaveProperty("search", term);
      if (body.data.length > 0) {
        const item = body.data[0];
        const combined = `${item.titleGe}${item.titleEn}`.toLowerCase();
        expect(combined).toContain(term.toLowerCase());
      }
    });

    test("PR-004: Category filter — all returned products match category", async ({ adminApi }) => {
      const category = "jewelry";
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { category },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      body.data.forEach((p: any) => expect(p.category).toMatch(/^jewelry/i));
    });

    test("PR-005: Partner filter — all returned products belong to the partner", async ({ adminApi }) => {
      const partnerId = process.env.ORGANIZER_PARTNER_ID;
      if (partnerId) {
        const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
          params: { partnerId },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        body.data.forEach((p: any) => expect(p.owner).toBe(partnerId));
      }
    });

    test("PR-006: Partner can list their own products via /partner/:id", async ({
      partnerApi,
      partnerUser,
    }) => {
      const res = await partnerApi.get(
        `${ENDPOINTS.ADMIN_PRODUCTS}/partner/${partnerUser.id}`,
      );
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.data)).toBe(true);
      body.data.forEach((p: any) => expect(p.owner).toBe(partnerUser.id));
    });

    test("PR-007: Partner cannot list products of another partner (access isolation)", async ({
      partnerApi,
    }) => {
      const anotherPartnerId = "67f123456789012345678901";
      const res = await partnerApi.get(
        `${ENDPOINTS.ADMIN_PRODUCTS}/partner/${anotherPartnerId}`,
      );
      expect(res.status()).toBe(403);
    });

    test("PR-008: 400 — Invalid partner ID format returns 4xx", async ({ adminApi }) => {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_PRODUCTS}/partner/invalid-id`,
      );
      expect([400, 422, 404]).toContain(res.status());
    });

    test("PR-009: Sort by price:asc — first item price ≤ last item price", async ({ adminApi }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { sort: "price:asc", limit: 50 },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      const prices: number[] = body.data.map((p: any) => p.price);
      if (prices.length > 1) {
        expect(prices[0]).toBeLessThanOrEqual(prices[prices.length - 1]);
      }
    });

    test("PR-009b: Sort by price:desc — first item price ≥ last item price", async ({ adminApi }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { sort: "price:desc", limit: 50 },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      const prices: number[] = body.data.map((p: any) => p.price);
      if (prices.length > 1) {
        expect(prices[0]).toBeGreaterThanOrEqual(prices[prices.length - 1]);
      }
    });

    test("PR-009c: Unknown sort field falls back to default (no 500)", async ({ adminApi }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { sort: "unknown_field:asc" },
      });
      expect(res.status()).toBe(200);
    });

    test("PR-009d: minPrice/maxPrice filter — returned prices are in range", async ({ adminApi }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { minPrice: 5, maxPrice: 100 },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      body.data.forEach((p: any) => {
        expect(p.price).toBeGreaterThanOrEqual(5);
        expect(p.price).toBeLessThanOrEqual(100);
      });
    });

    test("PR-009e: limit=0 is treated as minimum (1) — no DoS via zero limit", async ({ adminApi }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { limit: 0 },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.meta.limit).toBeGreaterThanOrEqual(1);
    });

    test("PR-009f: limit exceeding 100 is capped at 100", async ({ adminApi }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { limit: 9999 },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.meta.limit).toBeLessThanOrEqual(100);
    });

    test("PR-009g: Negative page defaults to 1", async ({ adminApi }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { page: -5 },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.meta.page).toBe(1);
    });

    test("PR-009h: inStock=true — all returned products have stockQuantity > 0", async ({ adminApi }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PRODUCTS, {
        params: { inStock: "true" },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      body.data.forEach((p: any) => {
        expect(p.stockQuantity).toBeGreaterThan(0);
      });
    });
  });
};

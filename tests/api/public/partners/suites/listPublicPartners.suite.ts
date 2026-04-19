import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS, DEFAULT_PARTNER } from "../../../../constants/endpoints.js";

export const listPublicPartnersSuites = (
  sharedState: { approvedPartnerEmail: string; pendingPartnerId: string }
) => {
  test.describe("1. GET /api/partner - List Public Partners", () => {
    test("PP-001: 200 — returns only approved partners", async ({ api }) => {
      const res = await api.get(ENDPOINTS.PARTNER_PUBLIC, {
        params: { search: sharedState.approvedPartnerEmail },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();

      expect(body.meta.totalCount).toBeGreaterThan(0);
      expect(body.data.some((p: any) => p.email === sharedState.approvedPartnerEmail)).toBe(
        true,
      );
    });

    test("PP-002: 200 — does NOT return pending partners", async ({ api }) => {
      const res = await api.get(ENDPOINTS.PARTNER_PUBLIC, {
        params: { search: "qa_pending" },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();

      const hasPending = body.data.some((p: any) => p._id === sharedState.pendingPartnerId);
      expect(hasPending).toBe(false);
    });

    test("PP-003: 200 — pagination works correctly", async ({ api }) => {
      const res = await api.get(ENDPOINTS.PARTNER_PUBLIC, {
        params: { page: 1, limit: 5 },
      });
      expect(res.status()).toBe(200);

      const body = await res.json();
      expect(body.meta.currentPage).toBe(1);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeLessThanOrEqual(5);
    });

    test("PP-004: 200 — city filter returns only matching partners", async ({
      api,
    }) => {
      const res = await api.get(ENDPOINTS.PARTNER_PUBLIC, {
        params: { city: DEFAULT_PARTNER.city },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();

      expect(body.data.every((p: any) => p.city === DEFAULT_PARTNER.city)).toBe(
        true,
      );
    });

    test("PP-011: 200 — search by partial name works", async ({ api }) => {
      const res = await api.get(ENDPOINTS.PARTNER_PUBLIC, {
        params: { search: DEFAULT_PARTNER.companyNameEn.substring(0, 4) },
      });
      expect(res.status()).toBe(200);
    });

    test("PP-012: 200 — empty search returns paginated results", async ({
      api,
    }) => {
      const res = await api.get(ENDPOINTS.PARTNER_PUBLIC);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.data)).toBe(true);
    });

    test("PP-013: 422 — invalid query parameters (negative page)", async ({
      api,
    }) => {
      const res = await api.get(ENDPOINTS.PARTNER_PUBLIC, {
        params: { page: -1 },
      });
      expect(res.status()).toBe(422);
    });
  });
};

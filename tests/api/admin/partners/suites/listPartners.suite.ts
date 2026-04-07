import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { PartnerStatusEnum } from "../../../../../src/types/partnerStatus.js";
import { createPendingPartner } from "../partners.helpers.js";

export const listPartnersSuites = () => {
  test.describe("1. GET /api/admin/partners — List Partners", () => {
    test("AA-001: 200 — returns paginated object of partners", async ({ adminApi }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PARTNERS);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("partners");
      expect(Array.isArray(body.partners)).toBe(true);
      expect(body).toHaveProperty("totalCount");
      expect(body).toHaveProperty("totalPages");
    });

    test("AA-002: 200 — search filter returns matching partner", async ({
      adminApi,
      api,
    }) => {
      const { email } = await createPendingPartner(api);

      const res = await adminApi.get(ENDPOINTS.ADMIN_PARTNERS, {
        params: { search: email },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.partners)).toBe(true);
      expect(body.partners.some((p: any) => p.email === email)).toBe(true);
    });

    test("AA-003: 200 — search with no match returns empty array", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PARTNERS, {
        params: { search: "this_email_will_never_exist_xyz_abc@nowhere.com" },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.partners)).toBe(true);
      expect(body.partners.length).toBe(0);
    });

    test("AA-004: 200 — filter by status=PENDING returns only pending partners", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PARTNERS, {
        params: { status: PartnerStatusEnum.PENDING },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.partners)).toBe(true);
      for (const partner of body.partners) {
        expect(partner.status).toBe(PartnerStatusEnum.PENDING);
      }
    });

    test("AA-005: 200 — filter by status=APPROVED returns only approved partners", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PARTNERS, {
        params: { status: PartnerStatusEnum.APPROVED },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      for (const partner of body.partners) {
        expect(partner.status).toBe(PartnerStatusEnum.APPROVED);
      }
    });

    test("AA-006: 200 — pagination: page=1 returns correct slice", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PARTNERS, {
        params: { page: 1, limit: 5 },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("totalCount");
      expect(Array.isArray(body.partners)).toBe(true);
      expect(body.partners.length).toBeLessThanOrEqual(5);
    });

    test("AA-007: 200 — no passwords in list response", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PARTNERS);
      const body = await res.json();
      for (const partner of body.partners) {
        expect(partner).not.toHaveProperty("password");
        expect(partner).not.toHaveProperty("passwordHash");
      }
    });

    test("AA-008: 401 — no token returns 401", async ({ api }) => {
      const res = await api.get(ENDPOINTS.ADMIN_PARTNERS);
      expect(res.status()).toBe(401);
    });

    test("AA-009: 403 — partner-role token cannot list all partners", async ({
      partnerApi,
    }) => {
      const res = await partnerApi.get(ENDPOINTS.ADMIN_PARTNERS);
      expect(res.status()).toBe(403);
    });

    test("AA-010: 400 — invalid status filter value", async ({ adminApi }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PARTNERS, {
        params: { status: "NOT_A_REAL_STATUS" },
      });
      expect(res.status()).toBe(422);
    });

    test("AA-011: 200 — empty search string returns partners object (no crash)", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PARTNERS, {
        params: { search: "" },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("partners");
      expect(Array.isArray(body.partners)).toBe(true);
    });

    test("AA-012: 200 — extremely long search string does not crash server", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PARTNERS, {
        params: { search: "a".repeat(500) },
      });
      expect([200, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });
  });
};

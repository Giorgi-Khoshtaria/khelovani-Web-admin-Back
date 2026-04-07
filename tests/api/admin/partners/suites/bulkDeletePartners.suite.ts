import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createPendingPartner } from "../partners.helpers.js";

export const bulkDeletePartnersSuites = () => {
  test.describe("POST /api/admin/partners/bulk-delete — Bulk Delete Partners", () => {
    test("BD-001: 200 — successfully deletes multiple partners", async ({ adminApi, api }) => {
      const p1 = await createPendingPartner(api);
      const p2 = await createPendingPartner(api);
      
      const res = await adminApi.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", {
        data: { ids: [p1.id, p2.id] },
      });
      
      expect(res.status()).toBe(200);
      
      // Verify they are gone
      const check1 = await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${p1.id}`);
      expect(check1.status()).toBe(404);
      
      const check2 = await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${p2.id}`);
      expect(check2.status()).toBe(404);
    });

    test("BD-002: 400 — empty ids list returns error", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", {
        data: { ids: [] },
      });
      expect(res.status()).toBe(422);
    });

    test("BD-003: 401 — unauthorized user cannot bulk delete", async ({ api }) => {
      const res = await api.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", {
        data: { ids: ["some-id"] },
      });
      expect(res.status()).toBe(401);
    });

    test("BD-004: 403 — partner-role token cannot bulk delete", async ({ partnerApi }) => {
      const res = await partnerApi.post(ENDPOINTS.ADMIN_PARTNERS + "/bulk-delete", {
        data: { ids: ["some-id"] },
      });
      expect(res.status()).toBe(403);
    });
  });
};

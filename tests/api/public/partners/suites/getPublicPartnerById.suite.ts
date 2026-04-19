import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";

export const getPublicPartnerByIdSuites = (
  sharedState: { approvedPartnerId: string; approvedPartnerEmail: string; pendingPartnerId: string }
) => {
  test.describe("2. GET /api/partner/:id - Get by ID", () => {
    test("PP-007: 422 — invalid ObjectId format", async ({ api }) => {
      const res = await api.get(`${ENDPOINTS.PARTNER_PUBLIC}/invalid-id`);
      expect(res.status()).toBe(422);
    });

    test("PP-008: 404 — partner does not exist", async ({ api }) => {
      const fakeId = "507f1f77bcf86cd799439011"; // valid format but non-existent
      const res = await api.get(`${ENDPOINTS.PARTNER_PUBLIC}/${fakeId}`);
      expect(res.status()).toBe(404);
    });

    test("PP-009: 404 — pending partner is hidden from public", async ({
      api,
    }) => {
      const res = await api.get(
        `${ENDPOINTS.PARTNER_PUBLIC}/${sharedState.pendingPartnerId}`,
      );
      expect(res.status()).toBe(404);
    });

    test("PP-010: 200 — returns full public data for approved partner", async ({
      api,
    }) => {
      const res = await api.get(
        `${ENDPOINTS.PARTNER_PUBLIC}/${sharedState.approvedPartnerId}`,
      );
      expect(res.status()).toBe(200);

      const body = await res.json();
      expect(body.data.email).toBe(sharedState.approvedPartnerEmail);
      expect(body.data).toHaveProperty("companyNameEn");
      expect(body.data).toHaveProperty("city");
      expect(body.data).not.toHaveProperty("internalField"); // example of sensitive data hiding
    });
  });
};

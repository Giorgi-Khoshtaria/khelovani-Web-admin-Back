import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { PartnerStatusEnum } from "../../../../../src/types/partnerStatus.js";
import { createPendingPartner } from "../partners.helpers.js";

export const partnerResponseContractSuites = () => {
  test.describe("6. Response Shape Contract", () => {
    test("AA-090: GET list — Content-Type is application/json", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PARTNERS);
      expect(res.headers()["content-type"]).toContain("application/json");
    });

    test("AA-091: GET by id — data has required fields", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const body = await (
        await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`)
      ).json();

      // Envelope
      expect(body).toHaveProperty("success", true);
      expect(body).toHaveProperty("message");
      expect(body).toHaveProperty("data");

      // Partner fields
      expect(body.data).toHaveProperty("_id");
      expect(body.data).toHaveProperty("email");
      expect(body.data).toHaveProperty("status");
      expect(body.data).toHaveProperty("createdAt");
      expect(body.data).toHaveProperty("updatedAt");
    });

    test("AA-092: GET by id — _id in data matches requested id", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const body = await (
        await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`)
      ).json();
      expect(body.data._id).toBe(id);
    });

    test("AA-093: 422 error response is JSON object with errors array", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`,
        { data: { status: "INVALID" } },
      );
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(body).toHaveProperty("errors");
      expect(Array.isArray(body.errors)).toBe(true);
    });

    test("AA-094: 404 error response is JSON object with message", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_PARTNERS}/000000000000000000000000`,
      );
      const body = await res.json().catch(() => null);
      expect(body).not.toBeNull();
      expect(body).toHaveProperty("message");
    });

    test("AA-095: PATCH 200 — response data contains updated status field", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const body = await (
        await adminApi.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`, {
          data: { status: PartnerStatusEnum.APPROVED },
        })
      ).json();
      expect(body.data.status).toBe(PartnerStatusEnum.APPROVED);
    });

    test("AA-096: all error responses are JSON objects — never plain strings", async ({
      adminApi,
    }) => {
      const cases = [
        adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/bad-id`),
        adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/000000000000000000000000`),
      ];
      for (const promise of cases) {
        const res = await promise;
        const body = await res.json().catch(() => null);
        expect(body).not.toBeNull();
        expect(typeof body).toBe("object");
        expect(Array.isArray(body)).toBe(false);
      }
    });

    test("AA-097: GET list — envelope has data array and meta object", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PARTNERS);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("success", true);
      expect(body).toHaveProperty("data");
      expect(Array.isArray(body.data)).toBe(true);
      expect(body).toHaveProperty("meta");
      expect(typeof body.meta.totalCount).toBe("number");
      expect(typeof body.meta.totalPages).toBe("number");
      expect(typeof body.meta.currentPage).toBe("number");
    });
  });
};

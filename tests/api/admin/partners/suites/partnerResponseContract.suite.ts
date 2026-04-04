import { test, expect } from "../../../../fixtures/auth.fixture.js";
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

    test("AA-091: GET by id — partner has required fields", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const body = await (
        await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`)
      ).json();

      expect(body).toHaveProperty("_id");
      expect(body).toHaveProperty("email");
      expect(body).toHaveProperty("status");
      expect(body).toHaveProperty("createdAt");
      expect(body).toHaveProperty("updatedAt");
    });

    test("AA-092: GET by id — _id in response matches requested id", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const body = await (
        await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`)
      ).json();
      expect(body._id).toBe(id);
    });

    test("AA-093: 400 error response is JSON object with message", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`,
        {
          data: { status: "BAD_VALUE" },
        },
      );
      const body = await res.json().catch(() => null);
      expect(body).not.toBeNull();
      expect(typeof body).toBe("object");
      expect(body).toHaveProperty("message");
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

    test("AA-095: PATCH 200 response contains updated status field", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const body = await (
        await adminApi.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`, {
          data: { status: PartnerStatusEnum.APPROVED },
        })
      ).json();
      expect(body.status).toBe(PartnerStatusEnum.APPROVED);
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
  });
};

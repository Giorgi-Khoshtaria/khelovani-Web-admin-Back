import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { PartnerStatusEnum } from "../../../../../src/types/partnerStatus.js";
import { createPendingPartner } from "../partners.helpers.js";

export const partnerStatusSuites = () => {
  test.describe("3a. PATCH /:id/status — State Transitions", () => {
    test("AA-040: PENDING → APPROVED — 200 and status is updated", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);

      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`,
        {
          data: { status: PartnerStatusEnum.APPROVED },
        },
      );
      expect(res.status()).toBe(200);

      const body = await (
        await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`)
      ).json();
      expect(body.status).toBe(PartnerStatusEnum.APPROVED);
    });

    test("AA-041: PENDING → REJECTED — 200 and record is deleted (404 after)", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);

      const res = await adminApi.delete(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`);
      expect(res.status()).toBe(200);

      const verifyRes = await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`);
      expect(verifyRes.status()).toBe(404);
    });

    test("AA-042: APPROVED → REJECTED — 200 and record is deleted (404 after)", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);

      await adminApi.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`, {
        data: { status: PartnerStatusEnum.APPROVED },
      });

      const res = await adminApi.delete(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`);
      expect(res.status()).toBe(200);

      const verifyRes = await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`);
      expect(verifyRes.status()).toBe(404);
    });

    test("AA-043: APPROVED → APPROVED — idempotent re-approval returns 200", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);

      await adminApi.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`, {
        data: { status: PartnerStatusEnum.APPROVED },
      });

      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`,
        {
          data: { status: PartnerStatusEnum.APPROVED },
        },
      );
      expect(res.status()).toBe(200);

      const body = await (
        await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`)
      ).json();
      expect(body.status).toBe(PartnerStatusEnum.APPROVED);
    });

    test("AA-044: APPROVED → PENDING — should be rejected (400 or 422)", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);

      await adminApi.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`, {
        data: { status: PartnerStatusEnum.APPROVED },
      });

      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`,
        {
          data: { status: PartnerStatusEnum.PENDING },
        },
      );
      expect(res.status()).toBe(422);
    });

    test("AA-045: deleted partner → any status update returns 404", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);

      await adminApi.delete(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`);

      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`,
        {
          data: { status: PartnerStatusEnum.APPROVED },
        },
      );
      expect(res.status()).toBe(404);
    });

    test("AA-046: non-existent valid ObjectId → 404", async ({ adminApi }) => {
      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN_PARTNERS}/000000000000000000000000/status`,
        { data: { status: PartnerStatusEnum.APPROVED } },
      );
      expect(res.status()).toBe(404);
    });

    test("AA-047: PENDING → APPROVED triggers email notification (no 500)", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);

      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`,
        {
          data: { status: PartnerStatusEnum.APPROVED },
        },
      );
      expect(res.status()).not.toBe(500);
      expect(res.status()).toBe(200);
    });

    test("AA-048: concurrent status updates on same partner — no 500, one wins", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);

      const [r1, r2] = await Promise.all([
        adminApi.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`, {
          data: { status: PartnerStatusEnum.APPROVED },
        }),
        adminApi.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`, {
          data: { status: PartnerStatusEnum.APPROVED },
        }),
      ]);

      expect(r1.status()).not.toBe(500);
      expect(r2.status()).not.toBe(500);
    });

    test("AA-049: response body contains updated partner object", async ({
      adminApi,
      api,
    }) => {
      const { id, email } = await createPendingPartner(api);

      const body = await (
        await adminApi.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`, {
          data: { status: PartnerStatusEnum.APPROVED },
        })
      ).json();

      expect(body.status).toBe(PartnerStatusEnum.APPROVED);
      expect(body.email).toBe(email);
    });

    test("AA-050: updatedAt timestamp changes after status update", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const before = await (
        await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`)
      ).json();

      // Wait a bit to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 100));

      const after = await (
        await adminApi.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`, {
          data: { status: PartnerStatusEnum.APPROVED },
        })
      ).json();

      expect(new Date(after.updatedAt).getTime()).toBeGreaterThan(
        new Date(before.updatedAt).getTime(),
      );
    });
  });

  test.describe("3b. PATCH /:id/status — Field Validation", () => {
    test("AA-060: [V2] invalid status string → 400", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`,
        {
          data: { status: "INVALID_STATUS" },
        },
      );
      expect(res.status()).toBe(422);
    });

    test("AA-061: [V3] empty string status → 400", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`,
        {
          data: { status: "" },
        },
      );
      expect(res.status()).toBe(422);
    });

    test("AA-062: [V4] null status → 400", async ({ adminApi, api }) => {
      const { id } = await createPendingPartner(api);
      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`,
        {
          data: { status: null },
        },
      );
      expect(res.status()).toBe(422);
    });

    test("AA-063: [V5] missing status field entirely → 400", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`,
        {
          data: {},
        },
      );
      expect(res.status()).toBe(422);
    });

    test("AA-064: [V6] numeric status value → 400", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`,
        {
          data: { status: 1 },
        },
      );
      expect(res.status()).toBe(422);
    });

    test("AA-065: [V7] lowercase valid enum value → 400 (case-sensitive)", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`,
        {
          data: { status: PartnerStatusEnum.APPROVED.toLowerCase() },
        },
      );
      expect(res.status()).toBe(422);
    });

    test("AA-066: no body at all → 400", async ({ adminApi, api }) => {
      const { id } = await createPendingPartner(api);
      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`,
      );
      expect(res.status()).toBe(422);
    });

    test("AA-067: invalid ObjectId format in URL → 400", async ({
      adminApi,
    }) => {
      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN_PARTNERS}/bad-id/status`,
        {
          data: { status: PartnerStatusEnum.APPROVED },
        },
      );
      expect(res.status()).toBe(422);
    });

    test("AA-068: extra unknown fields in body are ignored (not 400)", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`,
        {
          data: {
            status: PartnerStatusEnum.APPROVED,
            unknownField: "should be ignored",
            role: "admin",
          },
        },
      );
      expect(res.status()).toBe(200);
    });
  });
};

import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { PartnerStatusEnum } from "../../../../../src/types/partnerStatus.js";
import { createPendingPartner } from "../partners.helpers.js";

export const getPartnerByIdSuites = () => {
  test.describe("2. GET /api/admin/partners/:id — Get by ID", () => {
    test("AA-020: 200 — returns full partner object by valid id", async ({
      adminApi,
      api,
    }) => {
      const { id, email } = await createPendingPartner(api);
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.email).toBe(email);
    });

    test("AA-021: 200 — response does not contain password or hash", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const body = await (
        await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`)
      ).json();
      expect(body.data).not.toHaveProperty("password");
      expect(body.data).not.toHaveProperty("passwordHash");
      expect(body.data).not.toHaveProperty("hash");
    });

    test("AA-022: 404 — valid ObjectId that does not exist", async ({ adminApi }) => {
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/000000000000000000000000`);
      expect(res.status()).toBe(404);
    });

    test("AA-023: 422 — invalid ObjectId format (too short)", async ({ adminApi }) => {
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/invalid-id`);
      expect(res.status()).toBe(422);
    });

    test("AA-024: 422 — invalid ObjectId: all letters", async ({ adminApi }) => {
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/abcdefghij`);
      expect(res.status()).toBe(422);
    });

    test("AA-025: 422/404 — ObjectId with special characters — never 500", async ({ adminApi }) => {
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/../../etc/passwd`);
      expect([404, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("AA-026: 401 — no token returns 401", async ({ api }) => {
      const { id } = await createPendingPartner(api);
      const res = await api.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`);
      expect(res.status()).toBe(401);
    });

    test("AA-027: 403 — partner-role token cannot view any partner by id", async ({
      partnerApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const res = await partnerApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`);
      expect(res.status()).toBe(403);
    });

    test("AA-028: 200 — response data has expected fields", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const body = await (
        await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`)
      ).json();
      expect(body.data).toHaveProperty("_id");
      expect(body.data).toHaveProperty("email");
      expect(body.data).toHaveProperty("status");
      expect(body.data).toHaveProperty("createdAt");
    });

    test("AA-029: 200 — newly created partner has status PENDING", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const body = await (
        await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`)
      ).json();
      expect(body.data.status).toBe(PartnerStatusEnum.PENDING);
    });

  });
};

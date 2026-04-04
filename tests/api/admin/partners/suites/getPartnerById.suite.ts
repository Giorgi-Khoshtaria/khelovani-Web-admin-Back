import { test, expect } from "../../../../fixtures/auth.fixture.js";
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
      expect(body.email).toBe(email);
    });

    test("AA-021: 200 — response does not contain password or hash", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);

      const body = await (
        await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`)
      ).json();
      expect(body).not.toHaveProperty("password");
      expect(body).not.toHaveProperty("passwordHash");
      expect(body).not.toHaveProperty("hash");
    });

    test("AA-022: 404 — valid ObjectId that does not exist", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_PARTNERS}/000000000000000000000000`,
      );
      expect(res.status()).toBe(404);
    });

    test("AA-023: 400 — invalid ObjectId format (too short)", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/invalid-id`);
      expect(res.status()).toBe(400);
    });

    test("AA-024: 400 — invalid ObjectId: all letters", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/abcdefghij`);
      expect(res.status()).toBe(400);
    });

    test("AA-025: 400 — ObjectId with special characters", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_PARTNERS}/../../etc/passwd`,
      );
      expect([400, 404]).toContain(res.status());
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

    test("AA-028: 200 — response has expected shape (id, email, status, createdAt)", async ({
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
    });

    test("AA-029: 200 — newly created partner has status PENDING", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const body = await (
        await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`)
      ).json();
      expect(body.status).toBe(PartnerStatusEnum.PENDING);
    });

    test("AA-030: 400 — ObjectId with SQL injection payload", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/' OR '1'='1`);
      expect([400, 404]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });
  });
};

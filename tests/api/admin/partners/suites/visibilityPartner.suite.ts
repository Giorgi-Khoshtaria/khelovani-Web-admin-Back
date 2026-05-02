import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import {
  createPendingPartner,
  approvePartner,
  pinPartner,
  setVisibility,
} from "../partners.helpers.js";
import { DbHelper } from "../../../../helpers/db/db.helper.js";

export const visibilityPartnerSuites = () => {
  test.describe("Partner Visibility — PATCH /:id/visibility", () => {
    let createdIds: string[] = [];

    test.afterEach(async () => {
      for (const id of createdIds) {
        await DbHelper.deletePartnerById(id).catch(() => {});
      }
      createdIds = [];
    });

    test("PP-VIS-001: hiding a partner sets isShown=false", async ({ adminApi, api }) => {
      const { id } = await createPendingPartner(api);
      createdIds.push(id);
      await approvePartner(adminApi, id);

      const res = await setVisibility(adminApi, id, false);
      expect(res.status()).toBe(200);
      expect((await res.json()).data.isShown).toBe(false);
    });

    test("PP-VIS-002: showing a partner sets isShown=true", async ({ adminApi, api }) => {
      const { id } = await createPendingPartner(api);
      createdIds.push(id);
      await approvePartner(adminApi, id);
      await setVisibility(adminApi, id, false);

      const res = await setVisibility(adminApi, id, true);
      expect(res.status()).toBe(200);
      expect((await res.json()).data.isShown).toBe(true);
    });

    test("PP-VIS-003: hidden partner excluded from public listing", async ({ adminApi, api }) => {
      const { id, email } = await createPendingPartner(api);
      createdIds.push(id);
      await approvePartner(adminApi, id);
      await setVisibility(adminApi, id, false);

      const body = await (
        await api.get(ENDPOINTS.PARTNER_PUBLIC, { params: { search: email } })
      ).json();
      expect(body.data.some((p: any) => p._id === id)).toBe(false);
    });

    test("PP-VIS-004: hidden partner returns 404 on public detail endpoint", async ({ adminApi, api }) => {
      const { id } = await createPendingPartner(api);
      createdIds.push(id);
      await approvePartner(adminApi, id);
      await setVisibility(adminApi, id, false);

      const res = await api.get(`${ENDPOINTS.PARTNER_PUBLIC}/${id}`);
      expect(res.status()).toBe(404);
    });

    test("PP-VIS-005: hidden partner still visible to admin listing", async ({ adminApi, api }) => {
      const { id, email } = await createPendingPartner(api);
      createdIds.push(id);
      await approvePartner(adminApi, id);
      await setVisibility(adminApi, id, false);

      const body = await (
        await adminApi.get(ENDPOINTS.ADMIN_PARTNERS, { params: { search: email } })
      ).json();
      expect(body.data.some((p: any) => p._id === id)).toBe(true);
    });

    test("PP-VIS-006: hidden+pinned partner excluded from /pinned endpoint", async ({ adminApi, api }) => {
      const { id } = await createPendingPartner(api);
      createdIds.push(id);
      await approvePartner(adminApi, id);
      await pinPartner(adminApi, id, true);
      await setVisibility(adminApi, id, false);

      const body = await (await api.get(ENDPOINTS.PARTNER_PINNED)).json();
      expect(body.data.some((p: any) => p._id === id)).toBe(false);
    });

    test("PP-VIS-007: re-showing restores partner to public listing", async ({ adminApi, api }) => {
      const { id, email } = await createPendingPartner(api);
      createdIds.push(id);
      await approvePartner(adminApi, id);
      await setVisibility(adminApi, id, false);
      await setVisibility(adminApi, id, true);

      const body = await (
        await api.get(ENDPOINTS.PARTNER_PUBLIC, { params: { search: email } })
      ).json();
      expect(body.data.some((p: any) => p._id === id)).toBe(true);
    });

    test("PP-VIS-008: response never exposes password field", async ({ adminApi, api }) => {
      const { id } = await createPendingPartner(api);
      createdIds.push(id);
      await approvePartner(adminApi, id);

      const body = await (await setVisibility(adminApi, id, false)).json();
      expect(body.data.password).toBeUndefined();
    });

    test("PP-VIS-009: 404 on unknown valid ObjectId", async ({ adminApi }) => {
      const res = await setVisibility(adminApi, "000000000000000000000000", false);
      expect(res.status()).toBe(404);
    });

    test("PP-VIS-010: 422 on invalid ObjectId format", async ({ adminApi }) => {
      const res = await setVisibility(adminApi, "not-an-id", false);
      expect(res.status()).toBe(422);
    });

    test("PP-VIS-011: 422 on missing isShown field", async ({ adminApi, api }) => {
      const { id } = await createPendingPartner(api);
      createdIds.push(id);
      const res = await adminApi.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/visibility`, { data: {} });
      expect(res.status()).toBe(422);
    });

    test("PP-VIS-012: 403 for partner role (no ORG_VISIBILITY permission)", async ({ partnerApi, api }) => {
      const { id } = await createPendingPartner(api);
      createdIds.push(id);
      const res = await partnerApi.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/visibility`, {
        data: { isShown: false },
      });
      expect(res.status()).toBe(403);
    });

    test("PP-VIS-013: 401 for unauthenticated request", async ({ api }) => {
      const { id } = await createPendingPartner(api);
      createdIds.push(id);
      const res = await api.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/visibility`, {
        data: { isShown: false },
      });
      expect(res.status()).toBe(401);
    });
  });
};

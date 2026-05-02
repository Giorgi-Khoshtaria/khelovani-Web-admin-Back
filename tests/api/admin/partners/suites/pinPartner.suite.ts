import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import {
  createPendingPartner,
  approvePartner,
  pinPartner,
} from "../partners.helpers.js";
import { DbHelper } from "../../../../helpers/db/db.helper.js";

export const pinPartnerSuites = () => {
  test.describe("Pin Partner — PATCH /:id/pin", () => {
    let createdIds: string[] = [];

    test.afterEach(async () => {
      for (const id of createdIds) {
        await DbHelper.deletePartnerById(id).catch(() => {});
      }
      createdIds = [];
    });

    test("PP-PIN-001: pin sets isPinned=true and pinnedAt, evicted is empty", async ({ adminApi, api }) => {
      const { id } = await createPendingPartner(api);
      createdIds.push(id);
      await approvePartner(adminApi, id);

      const res = await pinPartner(adminApi, id, true);
      expect(res.status()).toBe(200);

      const body = await res.json();
      expect(body.data.isPinned).toBe(true);
      expect(body.data.pinnedAt).not.toBeNull();
      expect(body.meta.evicted).toEqual([]);
    });

    test("PP-PIN-002: unpin sets isPinned=false and pinnedAt=null", async ({ adminApi, api }) => {
      const { id } = await createPendingPartner(api);
      createdIds.push(id);
      await approvePartner(adminApi, id);
      await pinPartner(adminApi, id, true);

      const res = await pinPartner(adminApi, id, false);
      expect(res.status()).toBe(200);

      const body = await res.json();
      expect(body.data.isPinned).toBe(false);
      expect(body.data.pinnedAt).toBeNull();
      expect(body.meta.evicted).toEqual([]);
    });

    test("PP-PIN-003: re-pinning already-pinned partner is idempotent — pinnedAt unchanged, no eviction", async ({ adminApi, api }) => {
      const { id } = await createPendingPartner(api);
      createdIds.push(id);
      await approvePartner(adminApi, id);
      const firstBody = await (await pinPartner(adminApi, id, true)).json();
      const firstPinnedAt = firstBody.data.pinnedAt;

      const res = await pinPartner(adminApi, id, true);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.pinnedAt).toBe(firstPinnedAt);
      expect(body.meta.evicted).toEqual([]);
    });

    test("PP-PIN-004: 5th pin evicts the oldest of our set (FIFO by pinnedAt asc)", async ({ adminApi, api }) => {
      const ids: string[] = [];
      for (let i = 0; i < 5; i++) {
        const { id } = await createPendingPartner(api);
        ids.push(id);
        createdIds.push(id);
        await approvePartner(adminApi, id);
      }

      // Ensure none of our partners are pinned before we start — gives us a clean
      // known state independent of other parallel test workers.
      await DbHelper.unpinPartnersByIds(ids);

      // Pin ids[0..3] with deliberate gaps so pinnedAt ordering is deterministic
      // within our set.
      for (let i = 0; i < 4; i++) {
        await pinPartner(adminApi, ids[i], true);
        await new Promise((r) => setTimeout(r, 30));
      }

      // Pinning the 5th must evict at least one partner (cap = 4).
      const res = await pinPartner(adminApi, ids[4], true);
      expect(res.status()).toBe(200);

      const body = await res.json();
      expect(body.data.isPinned).toBe(true);
      expect(body.meta.evicted.length).toBeGreaterThanOrEqual(1);

      // Verify via DB: ids[0] (our oldest pinned) must no longer be pinned.
      // Other parallel tests may also have caused eviction of their own partners,
      // but ids[0] must be unpinned because it was the oldest within our set.
      const partner0 = await DbHelper.getPartnerById(ids[0]);
      expect(partner0.isPinned).toBe(false);

      // ids[4] must be pinned in DB too (not just in the response).
      const partner4 = await DbHelper.getPartnerById(ids[4]);
      expect(partner4.isPinned).toBe(true);
    });

    test("PP-PIN-005: GET /api/partner/pinned reflects eviction — shows new, not evicted", async ({ adminApi, api }) => {
      const ids: string[] = [];
      for (let i = 0; i < 5; i++) {
        const { id } = await createPendingPartner(api);
        ids.push(id);
        createdIds.push(id);
        await approvePartner(adminApi, id);
        if (i < 4) {
          await pinPartner(adminApi, id, true);
          await new Promise((r) => setTimeout(r, 25));
        }
      }
      await pinPartner(adminApi, ids[4], true);

      const res = await api.get(ENDPOINTS.PARTNER_PINNED);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.length).toBeLessThanOrEqual(4);
      expect(body.data.some((p: any) => p._id === ids[0])).toBe(false);
      expect(body.data.some((p: any) => p._id === ids[4])).toBe(true);
    });

    test("PP-PIN-006: GET /api/partner/pinned returns max 4, sorted newest pinnedAt first", async ({ adminApi, api }) => {
      const ids: string[] = [];
      for (let i = 0; i < 4; i++) {
        const { id } = await createPendingPartner(api);
        ids.push(id);
        createdIds.push(id);
        await approvePartner(adminApi, id);
        await pinPartner(adminApi, id, true);
        await new Promise((r) => setTimeout(r, 25));
      }

      const res = await api.get(ENDPOINTS.PARTNER_PINNED);
      expect(res.status()).toBe(200);
      const body = await res.json();

      expect(body.data.length).toBeLessThanOrEqual(4);
      expect(body.data.every((p: any) => p.isPinned === true)).toBe(true);
      for (let i = 1; i < body.data.length; i++) {
        expect(new Date(body.data[i - 1].pinnedAt).getTime()).toBeGreaterThanOrEqual(
          new Date(body.data[i].pinnedAt).getTime(),
        );
      }
    });

    test("PP-PIN-007: response never exposes password field", async ({ adminApi, api }) => {
      const { id } = await createPendingPartner(api);
      createdIds.push(id);
      await approvePartner(adminApi, id);

      const body = await (await pinPartner(adminApi, id, true)).json();
      expect(body.data.password).toBeUndefined();
    });

    test("PP-PIN-008: 404 on unknown valid ObjectId", async ({ adminApi }) => {
      const res = await pinPartner(adminApi, "000000000000000000000000", true);
      expect(res.status()).toBe(404);
    });

    test("PP-PIN-009: 422 on invalid ObjectId format", async ({ adminApi }) => {
      const res = await pinPartner(adminApi, "not-an-id", true);
      expect(res.status()).toBe(422);
    });

    test("PP-PIN-010: 422 on missing isPinned field", async ({ adminApi, api }) => {
      const { id } = await createPendingPartner(api);
      createdIds.push(id);
      const res = await adminApi.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/pin`, { data: {} });
      expect(res.status()).toBe(422);
    });

    test("PP-PIN-011: 422 on non-boolean isPinned value", async ({ adminApi, api }) => {
      const { id } = await createPendingPartner(api);
      createdIds.push(id);
      const res = await adminApi.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/pin`, {
        data: { isPinned: "yes" },
      });
      expect(res.status()).toBe(422);
    });

    test("PP-PIN-012: 403 for partner role (no ORG_PIN permission)", async ({ partnerApi, api }) => {
      const { id } = await createPendingPartner(api);
      createdIds.push(id);
      const res = await partnerApi.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/pin`, {
        data: { isPinned: true },
      });
      expect(res.status()).toBe(403);
    });

    test("PP-PIN-013: 401 for unauthenticated request", async ({ api }) => {
      const { id } = await createPendingPartner(api);
      createdIds.push(id);
      const res = await api.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/pin`, {
        data: { isPinned: true },
      });
      expect(res.status()).toBe(401);
    });
  });
};

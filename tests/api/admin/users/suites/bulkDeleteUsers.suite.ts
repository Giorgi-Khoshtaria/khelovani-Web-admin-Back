import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import {
  createEndUser,
  deleteEndUser,
} from "../../../../helpers/shared/users.helpers.js";

const BULK_URL = `${ENDPOINTS.ADMIN_USERS}/bulk-delete`;

export const bulkDeleteUsersSuites = () => {
  test.describe("4. POST /api/admin/users/bulk-delete — Bulk Delete", () => {
    test("USR-040: 200 — bulk delete two users returns deletedCount=2", async ({
      adminApi,
    }) => {
      const u1 = await createEndUser();
      const u2 = await createEndUser();
      try {
        const res = await adminApi.post(BULK_URL, {
          data: { ids: [u1.id, u2.id] },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.data.deletedCount).toBe(2);
      } finally {
        await deleteEndUser(u1.id, u1.email);
        await deleteEndUser(u2.id, u2.email);
      }
    });

    test("USR-041: 200 — bulk delete single user", async ({ adminApi }) => {
      const { id, email } = await createEndUser();
      try {
        const res = await adminApi.post(BULK_URL, { data: { ids: [id] } });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.data.deletedCount).toBe(1);
      } finally {
        await deleteEndUser(id, email);
      }
    });

    test("USR-042: 200 — bulk delete already-deleted IDs returns deletedCount=0", async ({
      adminApi,
    }) => {
      const { id, email } = await createEndUser();
      await adminApi.post(BULK_URL, { data: { ids: [id] } });
      await deleteEndUser(id, email);

      const res = await adminApi.post(BULK_URL, { data: { ids: [id] } });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.deletedCount).toBe(0);
    });

    test("USR-043: 422 — empty ids array", async ({ adminApi }) => {
      const res = await adminApi.post(BULK_URL, { data: { ids: [] } });
      expect(res.status()).toBe(422);
    });

    test("USR-044: 422 — missing ids field", async ({ adminApi }) => {
      const res = await adminApi.post(BULK_URL, { data: {} });
      expect(res.status()).toBe(422);
    });

    test("USR-045: 422 — ids contains invalid ObjectId", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(BULK_URL, {
        data: { ids: ["not-valid"] },
      });
      expect(res.status()).toBe(422);
    });

    test("USR-046: 422 — ids is not an array (string)", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(BULK_URL, {
        data: { ids: "000000000000000000000000" },
      });
      expect(res.status()).toBe(422);
    });

    test("USR-047: 200 — deleted users no longer appear in GET list", async ({
      adminApi,
    }) => {
      const u1 = await createEndUser();
      const u2 = await createEndUser();
      try {
        await adminApi.post(BULK_URL, { data: { ids: [u1.id, u2.id] } });

        const listRes = await adminApi.get(ENDPOINTS.ADMIN_USERS);
        const body = await listRes.json();
        const ids = body.data.map((u: any) => u._id);
        expect(ids).not.toContain(u1.id);
        expect(ids).not.toContain(u2.id);
      } finally {
        await deleteEndUser(u1.id, u1.email);
        await deleteEndUser(u2.id, u2.email);
      }
    });

    test("USR-048: 401 — unauthenticated request returns 401", async ({
      request,
    }) => {
      const res = await request.post(BULK_URL, {
        data: { ids: ["000000000000000000000000"] },
      });
      expect(res.status()).toBe(401);
    });
  });
};

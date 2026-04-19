import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createRole, deleteRole } from "../roles.helpers.js";

export const listRolesSuites = () => {
  test.describe("2. GET /api/admin/roles — List", () => {
    test("ROL-030: 200 — returns envelope with data array", async ({ adminApi }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_ROLES);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("data");
      expect(Array.isArray(body.data)).toBe(true);
    });

    test("ROL-031: 200 — newly created role appears in list", async ({ adminApi }) => {
      const { id, name } = await createRole(adminApi);
      try {
        const body = await (await adminApi.get(ENDPOINTS.ADMIN_ROLES)).json();
        expect(body.data.some((r: any) => r.name === name)).toBe(true);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-032: 200 — search by name returns matching role", async ({ adminApi }) => {
      const { id, name } = await createRole(adminApi);
      try {
        const res = await adminApi.get(ENDPOINTS.ADMIN_ROLES, {
          params: { search: name },
        });
        const body = await res.json();
        expect(body.data.some((r: any) => r.name === name)).toBe(true);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-033: 200 — search with no match returns empty data array", async ({ adminApi }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_ROLES, {
        params: { search: "this_will_never_match_xyz_99999" },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.length).toBe(0);
    });

    test("ROL-034: 200 — deleted role no longer in list", async ({ adminApi }) => {
      const { id, name } = await createRole(adminApi);
      await deleteRole(adminApi, id);

      const body = await (
        await adminApi.get(ENDPOINTS.ADMIN_ROLES, { params: { search: name } })
      ).json();
      expect(body.data.some((r: any) => r.name === name)).toBe(false);
    });

    test("ROL-035: 200 — pagination: limit=5 returns at most 5 items", async ({ adminApi }) => {
      const body = await (
        await adminApi.get(ENDPOINTS.ADMIN_ROLES, { params: { page: 1, limit: 5 } })
      ).json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeLessThanOrEqual(5);
    });

    test("ROL-036: 200 — no passwords or hashes in list response", async ({ adminApi }) => {
      const body = await (await adminApi.get(ENDPOINTS.ADMIN_ROLES)).json();
      for (const r of body.data) {
        expect(r).not.toHaveProperty("password");
        expect(r).not.toHaveProperty("passwordHash");
      }
    });

    test("ROL-037: 401 — no token returns 401", async ({ api }) => {
      expect((await api.get(ENDPOINTS.ADMIN_ROLES)).status()).toBe(401);
    });

    test("ROL-038: 403 — partner role cannot list roles", async ({ partnerApi }) => {
      expect((await partnerApi.get(ENDPOINTS.ADMIN_ROLES)).status()).toBe(403);
    });

    test("ROL-039: 200 — empty search string returns all (no crash)", async ({ adminApi }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_ROLES, { params: { search: "" } });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.data)).toBe(true);
    });

    test("ROL-040: negative page number handled gracefully — no 500", async ({ adminApi }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_ROLES, { params: { page: -1 } });
      expect([200, 400]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("ROL-041: 200 — filter by allowedPanels returns matching roles", async ({ adminApi }) => {
      const panel = "admin-organization";
      const { id } = await createRole(adminApi, { allowedPanels: [panel] });
      try {
        const res = await adminApi.get(ENDPOINTS.ADMIN_ROLES, { params: { panel } });
        expect(res.status()).toBe(200);
        const body = await res.json();
        for (const r of body.data) {
          expect(r.allowedPanels).toContain(panel);
        }
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-042: 200 — list items never expose permissions' full objects (only IDs or objects)", async ({ adminApi }) => {
      const body = await (await adminApi.get(ENDPOINTS.ADMIN_ROLES)).json();
      for (const r of body.data) {
        if (Array.isArray(r.permissions) && r.permissions.length > 0) {
          for (const p of r.permissions) {
            expect(typeof p === "string" || typeof p._id === "string").toBe(true);
          }
        }
      }
    });
  });
};

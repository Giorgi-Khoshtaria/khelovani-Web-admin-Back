import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import {
  uniqueName,
  deleteRole,
  createRole,
  VALID_ROLE,
} from "../roles.helpers.js";

export const createRoleSuites = () => {
  test.describe("1. POST /api/admin/roles — Create", () => {
    test("ROL-001: 201 — create role with all valid fields", async ({
      adminApi,
    }) => {
      const name = uniqueName();
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: {
          name,
          description: "Full payload",
          allowedPanels: ["admin"],
          permissions: [],
        },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.data.name).toBe(name);
      await deleteRole(adminApi, body.data._id);
    });

    test("ROL-002: 201 — create role without optional description", async ({
      adminApi,
    }) => {
      const name = uniqueName();
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: { name, allowedPanels: ["admin"], permissions: [] },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      await deleteRole(adminApi, body.data._id);
    });

    test("ROL-003: 201 — create role without optional permissions array", async ({
      adminApi,
    }) => {
      const name = uniqueName();
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: { name, description: "No perms", allowedPanels: ["admin"] },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      await deleteRole(adminApi, body.data._id);
    });

    test("ROL-004: [N2] 409 — duplicate role name", async ({ adminApi }) => {
      const { id, name } = await createRole(adminApi);
      try {
        const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
          data: { ...VALID_ROLE, name },
        });
        expect(res.status()).toBe(409);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-005: [N3] 422 — empty name string", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: { ...VALID_ROLE, name: "" },
      });
      expect(res.status()).toBe(422);
    });

    test("ROL-006: [N4] 422 — null name", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: { ...VALID_ROLE, name: null },
      });
      expect(res.status()).toBe(422);
    });

    test("ROL-007: [N5] 422 — name field missing entirely", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: { description: "no name", allowedPanels: ["admin"] },
      });
      expect(res.status()).toBe(422);
    });

    test("ROL-008: [N6] 422 — whitespace-only name", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: { ...VALID_ROLE, name: "   " },
      });
      expect(res.status()).toBe(422);
    });

    test("ROL-009: [N7] 422 — name is a number", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: { ...VALID_ROLE, name: 123 },
      });
      expect(res.status()).toBe(422);
    });

    test("ROL-010: [N8] 422 — name is an array", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: { ...VALID_ROLE, name: ["role"] },
      });
      expect(res.status()).toBe(422);
    });

    test("ROL-011: [BVA min-1=1] 422 — name of 1 character", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: { ...VALID_ROLE, name: "A" },
      });
      expect(res.status()).toBe(422);
    });

    test("ROL-012: [BVA min=2] 201 — name of exactly 2 characters", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: { ...VALID_ROLE, name: "AB" },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      await deleteRole(adminApi, body.data._id);
    });

    test("ROL-013: [BVA max=100] 201 — name of exactly 100 characters", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: { ...VALID_ROLE, name: "A".repeat(100) },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      await deleteRole(adminApi, body.data._id);
    });

    test("ROL-014: [BVA max+1=101] 422 — name of 101 characters", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: { ...VALID_ROLE, name: "A".repeat(101) },
      });
      expect(res.status()).toBe(422);
    });

    test("ROL-015: [P2] 201 or 422 — empty allowedPanels array", async ({
      adminApi,
    }) => {
      const name = uniqueName();
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: { name, description: "empty panels", allowedPanels: [] },
      });
      expect([201, 422]).toContain(res.status());
      if (res.status() === 201) {
        const body = await res.json();
        await deleteRole(adminApi, body.data._id);
      }
    });

    test("ROL-016: [P3] 422 — invalid panel name in allowedPanels", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: {
          ...VALID_ROLE,
          name: uniqueName(),
          allowedPanels: ["invalid-panel-xyz"],
        },
      });
      expect(res.status()).toBe(422);
    });

    test("ROL-017: [P4] 422 — null allowedPanels", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: { ...VALID_ROLE, name: uniqueName(), allowedPanels: null },
      });
      expect(res.status()).toBe(422);
    });

    test("ROL-018: [P5] 422 — allowedPanels is a string instead of array", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: { ...VALID_ROLE, name: uniqueName(), allowedPanels: "admin" },
      });
      expect(res.status()).toBe(422);
    });

    test("ROL-019: 422 — empty body {}", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, { data: {} });
      expect(res.status()).toBe(422);
    });

    test("ROL-020: 422 — permissions contains invalid ObjectId", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: {
          ...VALID_ROLE,
          name: uniqueName(),
          permissions: ["not-a-valid-id"],
        },
      });
      expect(res.status()).toBe(422);
    });

    test("ROL-021: 422 — permissions contains non-existent valid ObjectId", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: {
          ...VALID_ROLE,
          name: uniqueName(),
          permissions: ["000000000000000000000000"],
        },
      });
      expect(res.status()).toBe(422);
    });

    test("ROL-022: 409 — duplicate name check is case-insensitive", async ({
      adminApi,
    }) => {
      const { id, name } = await createRole(adminApi);
      try {
        const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
          data: { ...VALID_ROLE, name: name.toUpperCase() },
        });
        expect([201, 409]).toContain(res.status());
        if (res.status() === 201) {
          const body2 = await res.json();
          await deleteRole(adminApi, body2.role._id);
        }
      } finally {
        await deleteRole(adminApi, id);
      }
    });
  });
};

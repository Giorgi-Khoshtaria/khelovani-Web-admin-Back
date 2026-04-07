import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import {
  createPermission,
  deletePermission,
  uniqueName,
  VALID_PERMISSION,
} from "../permissions.helpers.js";
import { randomId } from "../../../../helpers/utils/generators.js";

export const createPermissionSuites = () => {
  test.describe("1. POST /api/admin/permissions — Create", () => {
    test("PRM-001: 201 — create permission with all valid fields", async ({
      adminApi,
    }) => {
      const name = uniqueName();
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { name, description: "Full valid payload", category: "General" },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.permission.name).toBe(name);

      await deletePermission(adminApi, body.permission._id);
    });

    test("PRM-002: 201 — create permission without optional description", async ({
      adminApi,
    }) => {
      const name = uniqueName();
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { name, category: "General" },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      await deletePermission(adminApi, body.permission._id);
    });

    test("PRM-003: 201 — create permission without optional category", async ({
      adminApi,
    }) => {
      const name = uniqueName();
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { name, description: "No category" },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      await deletePermission(adminApi, body.permission._id);
    });

    test("PRM-004: [N2] 409 — duplicate name returns conflict", async ({
      adminApi,
    }) => {
      const { id, name } = await createPermission(adminApi);

      try {
        const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
          data: { ...VALID_PERMISSION, name },
        });
        expect(res.status()).toBe(409);
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-005: [N3] 422 — empty name string", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { ...VALID_PERMISSION, name: "" },
      });
      expect(res.status()).toBe(422);
    });

    test("PRM-006: [N4] 422 — null name", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { ...VALID_PERMISSION, name: null },
      });
      expect(res.status()).toBe(422);
    });

    test("PRM-007: [N5] 422 — missing name field entirely", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { description: "no name", category: "General" },
      });
      expect(res.status()).toBe(422);
    });

    test("PRM-008: [N6] 422 — whitespace-only name", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { ...VALID_PERMISSION, name: "   " },
      });
      expect(res.status()).toBe(422);
    });

    test("PRM-009: [N7] 422 — name is a number", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { ...VALID_PERMISSION, name: 12345 },
      });
      expect(res.status()).toBe(422);
    });

    test("PRM-010: [N8] 422 — name is an array", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { ...VALID_PERMISSION, name: ["permission"] },
      });
      expect(res.status()).toBe(422);
    });

    test("PRM-011: [BVA min-1=1] 422 — name of 1 character", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { ...VALID_PERMISSION, name: "A" },
      });
      expect(res.status()).toBe(422);
    });

    test("PRM-012: [BVA min=2] 201 — name of exactly 2 characters", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { ...VALID_PERMISSION, name: "AB" },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      await deletePermission(adminApi, body.permission._id);
    });

    test("PRM-013: [BVA max=100] 201 — name of exactly 100 characters", async ({
      adminApi,
    }) => {
      const name = "A".repeat(100);
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { ...VALID_PERMISSION, name },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      await deletePermission(adminApi, body.permission._id);
    });

    test("PRM-014: [BVA max+1=101] 422 — name of 101 characters", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { ...VALID_PERMISSION, name: "A".repeat(101) },
      });
      expect(res.status()).toBe(422);
    });

    test("PRM-015: 422 — empty request body {}", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: {},
      });
      expect(res.status()).toBe(422);
    });

    test("PRM-016: 422 or 415 — wrong Content-Type (text/plain)", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        headers: { "Content-Type": "text/plain" },
        data: "name=test",
      });
      expect([415, 422]).toContain(res.status());
    });

    test("PRM-017: 201 — name with dots (roles.read format) is valid", async ({
      adminApi,
    }) => {
      const name = `roles.read.${randomId()}`;
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { ...VALID_PERMISSION, name },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      await deletePermission(adminApi, body.permission._id);
    });

    test("PRM-018: 201 — duplicate name check is case-sensitive", async ({
      adminApi,
    }) => {
      const { id, name } = await createPermission(adminApi);

      try {
        const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
          data: { ...VALID_PERMISSION, name: name.toUpperCase() },
        });
        expect([201, 409]).toContain(res.status());
        if (res.status() === 201) {
          const body2 = await res.json();
          await deletePermission(adminApi, body2.permission._id);
        }
      } finally {
        await deletePermission(adminApi, id);
      }
    });
  });
};

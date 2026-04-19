import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createPermission, deletePermission, uniqueName, VALID_PERMISSION } from "../permissions.helpers.js";
import {
  permissionNameScenarios,
  permissionDescriptionScenarios,
  LIMITS,
} from "../../../../helpers/shared/validation.helper.js";

export const permissionValidationSuites = () => {
  test.describe("6. Permission Field Validation", () => {
    // ── name ──────────────────────────────────────────────────────────
    test.describe("name field", () => {
      for (const { id, value, note } of permissionNameScenarios) {
        test(`${id}: 422 — name: ${note}`, async ({ adminApi }) => {
          const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
            data: { ...VALID_PERMISSION, name: value },
          });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(Array.isArray(body.errors)).toBe(true);
          expect(body.errors.some((e: any) => e.field === "name")).toBe(true);
        });
      }

      test("PRM-VAL-010: 201 — name at min boundary (2 chars)", async ({ adminApi }) => {
        const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
          data: { ...VALID_PERMISSION, name: "AB" },
        });
        expect(res.status()).toBe(201);
        const body = await res.json();
        await deletePermission(adminApi, body.data._id);
      });

      test("PRM-VAL-011: 201 — name at max boundary (100 chars)", async ({ adminApi }) => {
        const name = "A".repeat(LIMITS.permission.name.max);
        const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
          data: { ...VALID_PERMISSION, name },
        });
        expect(res.status()).toBe(201);
        const body = await res.json();
        await deletePermission(adminApi, body.data._id);
      });

      test("PRM-VAL-012: 422 — name missing entirely", async ({ adminApi }) => {
        const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
          data: { description: "no name", category: "General" },
        });
        expect(res.status()).toBe(422);
      });

      test("PRM-VAL-013: 422 — name is null", async ({ adminApi }) => {
        const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
          data: { ...VALID_PERMISSION, name: null },
        });
        expect(res.status()).toBe(422);
      });

      test("PRM-VAL-014: 422 — name is whitespace only", async ({ adminApi }) => {
        const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
          data: { ...VALID_PERMISSION, name: "   " },
        });
        expect(res.status()).toBe(422);
      });

      test("PRM-VAL-015: 422 — name is number type", async ({ adminApi }) => {
        const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
          data: { ...VALID_PERMISSION, name: 12345 },
        });
        expect(res.status()).toBe(422);
      });
    });

    // ── description ───────────────────────────────────────────────────
    test.describe("description field", () => {
      for (const { id, value, note } of permissionDescriptionScenarios) {
        test(`${id}: 422 — description: ${note}`, async ({ adminApi }) => {
          const { id: permId } = await createPermission(adminApi);
          try {
            const res = await adminApi.put(`${ENDPOINTS.ADMIN_PERMISSIONS}/${permId}`, {
              data: { description: value },
            });
            expect(res.status(), `${id}: ${note}`).toBe(422);
          } finally {
            await deletePermission(adminApi, permId);
          }
        });
      }

      test("PRM-VAL-020: 201 — description at max boundary (1000 chars)", async ({ adminApi }) => {
        const { id } = await createPermission(adminApi);
        try {
          const res = await adminApi.put(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`, {
            data: { description: "x".repeat(LIMITS.permission.description.max) },
          });
          expect(res.status()).toBe(200);
        } finally {
          await deletePermission(adminApi, id);
        }
      });

      test("PRM-VAL-021: 201 — description is omitted (optional)", async ({ adminApi }) => {
        const name = uniqueName();
        const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
          data: { name, category: "General" },
        });
        expect(res.status()).toBe(201);
        const body = await res.json();
        await deletePermission(adminApi, body.data._id);
      });
    });

    // ── empty body ────────────────────────────────────────────────────
    test("PRM-VAL-030: 422 — empty body returns errors array", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, { data: {} });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(Array.isArray(body.errors)).toBe(true);
    });
  });
};

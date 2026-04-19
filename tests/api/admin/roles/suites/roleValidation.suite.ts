import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createRole, deleteRole, uniqueName, VALID_ROLE } from "../roles.helpers.js";
import {
  roleNameScenarios,
  roleDescriptionScenarios,
  roleAllowedPanelsScenarios,
  LIMITS,
} from "../../../../helpers/shared/validation.helper.js";

export const roleValidationSuites = () => {
  test.describe("10. Role Field Validation", () => {
    // ── name ──────────────────────────────────────────────────────────
    test.describe("name field", () => {
      for (const { id, value, note } of roleNameScenarios) {
        test(`${id}: 422 — name: ${note}`, async ({ adminApi }) => {
          const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
            data: { ...VALID_ROLE, name: value },
          });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(Array.isArray(body.errors)).toBe(true);
          expect(body.errors.some((e: any) => e.field === "name")).toBe(true);
        });
      }

      test("ROL-VAL-010: 201 — name at min boundary (2 chars)", async ({ adminApi }) => {
        const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
          data: { ...VALID_ROLE, name: "AB" },
        });
        expect(res.status()).toBe(201);
        const body = await res.json();
        await deleteRole(adminApi, body.data._id);
      });

      test("ROL-VAL-011: 201 — name at max boundary (100 chars)", async ({ adminApi }) => {
        const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
          data: { ...VALID_ROLE, name: "A".repeat(LIMITS.role.name.max) },
        });
        expect(res.status()).toBe(201);
        const body = await res.json();
        await deleteRole(adminApi, body.data._id);
      });

      test("ROL-VAL-012: 422 — name is null", async ({ adminApi }) => {
        const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
          data: { ...VALID_ROLE, name: null },
        });
        expect(res.status()).toBe(422);
      });

      test("ROL-VAL-013: 422 — name missing entirely", async ({ adminApi }) => {
        const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
          data: { description: "no name", allowedPanels: ["admin"] },
        });
        expect(res.status()).toBe(422);
      });

      test("ROL-VAL-014: 422 — name is whitespace only", async ({ adminApi }) => {
        const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
          data: { ...VALID_ROLE, name: "   " },
        });
        expect(res.status()).toBe(422);
      });
    });

    // ── description ───────────────────────────────────────────────────
    test.describe("description field", () => {
      for (const { id, value, note } of roleDescriptionScenarios) {
        test(`${id}: 422 — description: ${note}`, async ({ adminApi }) => {
          const { id: roleId } = await createRole(adminApi);
          try {
            const res = await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${roleId}`, {
              data: { description: value },
            });
            expect(res.status(), `${id}: ${note}`).toBe(422);
          } finally {
            await deleteRole(adminApi, roleId);
          }
        });
      }

      test("ROL-VAL-020: 200 — description at max boundary (500 chars)", async ({ adminApi }) => {
        const { id } = await createRole(adminApi);
        try {
          const res = await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${id}`, {
            data: { description: "x".repeat(LIMITS.role.description.max) },
          });
          expect(res.status()).toBe(200);
        } finally {
          await deleteRole(adminApi, id);
        }
      });

      test("ROL-VAL-021: 201 — description omitted (optional)", async ({ adminApi }) => {
        const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
          data: { name: uniqueName(), allowedPanels: ["admin"] },
        });
        expect(res.status()).toBe(201);
        const body = await res.json();
        await deleteRole(adminApi, body.data._id);
      });
    });

    // ── allowedPanels ─────────────────────────────────────────────────
    test.describe("allowedPanels field", () => {
      for (const { id, value, note } of roleAllowedPanelsScenarios) {
        test(`${id}: 422 — allowedPanels: ${note}`, async ({ adminApi }) => {
          const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
            data: { ...VALID_ROLE, name: uniqueName(), allowedPanels: value },
          });
          expect(res.status(), `${id}: ${note}`).toBe(422);
        });
      }

      test("ROL-VAL-030: 201 — allowedPanels with all valid panel values", async ({ adminApi }) => {
        const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
          data: { ...VALID_ROLE, name: uniqueName(), allowedPanels: ["web", "admin", "admin-organization"] },
        });
        expect(res.status()).toBe(201);
        const body = await res.json();
        await deleteRole(adminApi, body.data._id);
      });

      test("ROL-VAL-031: 201 — allowedPanels with single valid panel", async ({ adminApi }) => {
        const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
          data: { ...VALID_ROLE, name: uniqueName(), allowedPanels: ["web"] },
        });
        expect(res.status()).toBe(201);
        const body = await res.json();
        await deleteRole(adminApi, body.data._id);
      });
    });

    // ── empty body ────────────────────────────────────────────────────
    test("ROL-VAL-040: 422 — empty body returns errors array", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, { data: {} });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(Array.isArray(body.errors)).toBe(true);
    });
  });
};

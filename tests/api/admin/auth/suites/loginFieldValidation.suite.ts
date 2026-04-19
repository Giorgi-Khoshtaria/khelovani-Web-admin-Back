import { expect } from "@playwright/test";
import { test } from "../../../../fixtures/admin.fixture.js";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import {
  loginEmailScenarios,
  loginPasswordScenarios,
  LIMITS,
} from "../../../../helpers/shared/validation.helper.js";

export const loginFieldValidationSuites = () => {
  test.describe("6. Admin Login Field Validation (format & length)", () => {
    const post = (request: any, data: Record<string, any>) =>
      request.post(`${ENDPOINTS.ADMIN_LOGIN}?lang=en`, { data });

    // ── email ─────────────────────────────────────────────────────────
    test.describe("email field", () => {
      for (const { id, value, note } of loginEmailScenarios) {
        test(`ADM-LGN-${id}: 422 — email: ${note}`, async ({ api }) => {
          const res = await post(api, { email: value, password: "SomePass123!" });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(Array.isArray(body.errors)).toBe(true);
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "email" }));
        });
      }

      test("ADM-LGN-VAL-010: 422 — email too long (over max)", async ({ api }) => {
        const longEmail = "a".repeat(LIMITS.login.email.max - 8) + "@test.com";
        const res = await post(api, { email: longEmail, password: "SomePass123!" });
        expect(res.status()).toBe(422);
      });

      test("ADM-LGN-VAL-011: 422 — email is null", async ({ api }) => {
        const res = await post(api, { email: null, password: "SomePass123!" });
        expect(res.status()).toBe(422);
      });

      test("ADM-LGN-VAL-012: 422 — email missing", async ({ api }) => {
        const res = await post(api, { password: "SomePass123!" });
        expect(res.status()).toBe(422);
      });
    });

    // ── password ──────────────────────────────────────────────────────
    test.describe("password field", () => {
      for (const { id, value, note } of loginPasswordScenarios) {
        test(`ADM-LGN-${id}: 422 — password: ${note}`, async ({ api }) => {
          const res = await post(api, { email: "admin@test.com", password: value });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(Array.isArray(body.errors)).toBe(true);
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "password" }));
        });
      }

      test("ADM-LGN-VAL-020: 422 — password is null", async ({ api }) => {
        const res = await post(api, { email: "admin@test.com", password: null });
        expect(res.status()).toBe(422);
      });

      test("ADM-LGN-VAL-021: 422 — password missing", async ({ api }) => {
        const res = await post(api, { email: "admin@test.com" });
        expect(res.status()).toBe(422);
      });

      test("ADM-LGN-VAL-022: 422 — password over max length", async ({ api }) => {
        const res = await post(api, {
          email: "admin@test.com",
          password: "A".repeat(LIMITS.login.password.max + 1),
        });
        expect([413, 422]).toContain(res.status());
      });
    });

    // ── strict mode ───────────────────────────────────────────────────
    test("ADM-LGN-VAL-030: 422 — empty body {}", async ({ api }) => {
      const res = await post(api, {});
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(Array.isArray(body.errors)).toBe(true);
    });

    test("ADM-LGN-VAL-031: 422 — unknown field in body", async ({ api }) => {
      const res = await post(api, {
        email: "admin@test.com",
        password: "SomePass123!",
        unknownField: "value",
      });
      expect(res.status()).toBe(422);
    });
  });
};

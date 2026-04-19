import { expect } from "@playwright/test";
import { test } from "../../../../../fixtures/user.fixture.js";
import { ENDPOINTS } from "../../../../../constants/endpoints.js";
import {
  loginEmailScenarios,
  loginPasswordScenarios,
  LIMITS,
} from "../../../../../helpers/shared/validation.helper.js";

export const loginFieldValidationSuites = () => {
  test.describe("6. Login Field Validation (format & length)", () => {
    const post = (request: any, data: Record<string, any>) =>
      request.post(ENDPOINTS.LOGIN, {
        data,
        headers: { "x-test-bypass": "khelovani-test-2026" },
      });

    // ── email ─────────────────────────────────────────────────────────
    test.describe("email field", () => {
      for (const { id, value, note } of loginEmailScenarios) {
        test(`${id}: 422 — email: ${note}`, async ({ request }) => {
          const res = await post(request, { email: value, password: "SomePass123!" });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(Array.isArray(body.errors)).toBe(true);
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "email" }));
        });
      }

      test("LGN-VAL-010: 422 — email too long (over max)", async ({ request }) => {
        const longEmail = "a".repeat(LIMITS.login.email.max - 8) + "@test.com";
        const res = await post(request, { email: longEmail, password: "SomePass123!" });
        expect(res.status()).toBe(422);
      });

      test("LGN-VAL-011: 422 — email is null", async ({ request }) => {
        const res = await post(request, { email: null, password: "SomePass123!" });
        expect(res.status()).toBe(422);
      });

      test("LGN-VAL-012: 422 — email missing", async ({ request }) => {
        const res = await post(request, { password: "SomePass123!" });
        expect(res.status()).toBe(422);
      });
    });

    // ── password ──────────────────────────────────────────────────────
    test.describe("password field", () => {
      for (const { id, value, note } of loginPasswordScenarios) {
        test(`${id}: 422 — password: ${note}`, async ({ request }) => {
          const res = await post(request, { email: "test@example.com", password: value });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(Array.isArray(body.errors)).toBe(true);
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "password" }));
        });
      }

      test("LGN-VAL-020: 422 — password is null", async ({ request }) => {
        const res = await post(request, { email: "test@example.com", password: null });
        expect(res.status()).toBe(422);
      });

      test("LGN-VAL-021: 422 — password missing", async ({ request }) => {
        const res = await post(request, { email: "test@example.com" });
        expect(res.status()).toBe(422);
      });
    });

    // ── strict mode ───────────────────────────────────────────────────
    test("LGN-VAL-030: 422 — empty body {}", async ({ request }) => {
      const res = await post(request, {});
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(Array.isArray(body.errors)).toBe(true);
    });

    test("LGN-VAL-031: 422 — unknown field in body", async ({ request }) => {
      const res = await post(request, {
        email: "test@example.com",
        password: "SomePass123!",
        unknownField: "value",
      });
      expect(res.status()).toBe(422);
    });
  });
};

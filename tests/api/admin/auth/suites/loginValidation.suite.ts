import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { emailValidationScenarios, loginPasswordScenarios } from "../../../../helpers/shared/validation.helper.js";
import { adminLogin } from "../auth.helpers.js";

export const loginValidationSuites = () => {
  // ─── Email Validation ────────────────────────────────────────────
  test.describe("2. Email Validation", () => {
    emailValidationScenarios.forEach((scenario) => {
      test(`AL-E${scenario.id.split("-").pop()?.padStart(3, "0")}: 422 — Email: ${scenario.note}`, async ({ api }) => {
        const res = await adminLogin(api, { email: scenario.value, password: "ValidAdminPass123!" });
        expect(res.status(), `Expected 422 for email scenario: ${scenario.note}`).toBe(422);
        const body = await res.json();
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors.some((e: any) => e.field === "email")).toBe(true);
      });
    });

    test("AL-E010: 422 — email is null", async ({ api }) => {
      const res = await adminLogin(api, { email: null as any, password: "ValidAdminPass123!" });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(Array.isArray(body.errors)).toBe(true);
    });

    test("AL-E011: 422 — email is a number", async ({ api }) => {
      const res = await adminLogin(api, { email: 12345 as any, password: "ValidAdminPass123!" });
      expect(res.status()).toBe(422);
    });

    test("AL-E012: 422 — email longer than 255 characters", async ({ api }) => {
      const res = await adminLogin(api, {
        email: "a".repeat(245) + "@test.com",
        password: "ValidAdminPass123!",
      });
      expect(res.status()).toBe(422);
    });
  });

  // ─── Password Validation ─────────────────────────────────────────
  // Login schema only checks: non-empty string, max 100 chars.
  // Complexity rules (uppercase, digits, etc.) apply only to registration.
  test.describe("3. Password Validation", () => {
    for (const { id, value, note } of loginPasswordScenarios) {
      test(`${id}: 422 — Password: ${note}`, async ({ api }) => {
        const res = await adminLogin(api, { email: "admin@test.com", password: value });
        expect(res.status()).toBe(422);
        const body = await res.json();
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors.some((e: any) => e.field === "password")).toBe(true);
      });
    }

    test("AL-P002: 422 — password is null", async ({ api }) => {
      const res = await adminLogin(api, { email: "admin@test.com", password: null as any });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(Array.isArray(body.errors)).toBe(true);
    });

    test("AL-P003: 422 — password is a number (wrong type)", async ({ api }) => {
      const res = await adminLogin(api, { email: "admin@test.com", password: 123456 as any });
      expect(res.status()).toBe(422);
    });

    test("AL-P005: 422 — missing password field entirely", async ({ api }) => {
      const res = await api.post(`${ENDPOINTS.ADMIN_LOGIN}?lang=en`, {
        data: { email: "admin@test.com" },
      });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(Array.isArray(body.errors)).toBe(true);
      expect(body.errors.some((e: any) => e.field === "password")).toBe(true);
    });
  });

  // ─── Missing Fields ──────────────────────────────────────────────
  test.describe("4. Missing / Empty Body", () => {
    test("AL-014: 422 — missing email field", async ({ api }) => {
      const res = await api.post(`${ENDPOINTS.ADMIN_LOGIN}?lang=en`, {
        data: { password: "ValidAdminPass123!" },
      });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(Array.isArray(body.errors)).toBe(true);
      expect(body.errors.some((e: any) => e.field === "email")).toBe(true);
    });

    test("AL-015: 422 — empty body {}", async ({ api }) => {
      const res = await api.post(`${ENDPOINTS.ADMIN_LOGIN}?lang=en`, { data: {} });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(Array.isArray(body.errors)).toBe(true);
      expect(body.errors.length).toBeGreaterThanOrEqual(2);
    });

    test("AL-016: 422 — both fields are empty strings", async ({ api }) => {
      const res = await adminLogin(api, { email: "", password: "" });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(Array.isArray(body.errors)).toBe(true);
    });
  });

  // ─── Credential / Business Logic Errors ─────────────────────────
  test.describe("5. Credential & Business Logic Errors", () => {
    test("AL-011: 422 — non-existent admin returns generic error", async ({ api }) => {
      const res = await adminLogin(api, {
        email: "nonexistent.admin@company.com",
        password: "AnyPass123!",
      });
      expect([401, 422]).toContain(res.status());
      const body = await res.json();
      expect(typeof body.message).toBe("string");
      expect(body.message).toMatch(/not found|invalid credentials|invalid email or password/i);
    });

    test("AL-012: 422 — wrong password for existing admin", async ({ createAdminUser, api }) => {
      const admin = await createAdminUser();
      const res = await adminLogin(api, {
        email: admin.email,
        password: "CompletelyWrongPassword999!",
      });
      expect([401, 422]).toContain(res.status());
      const body = await res.json();
      expect(typeof body.message).toBe("string");
      expect(body.message).toMatch(/invalid credentials|wrong password|invalid email or password/i);
    });

    test("AL-017: same error status for wrong email vs wrong password (no enumeration)", async ({
      createAdminUser,
      api,
    }) => {
      const admin = await createAdminUser();
      const wrongEmailRes = await adminLogin(api, {
        email: "nonexistent_xyz@company.com",
        password: "ValidAdminPass123!",
      });
      const wrongPassRes = await adminLogin(api, {
        email: admin.email,
        password: "CompletelyWrong999!",
      });
      expect(wrongEmailRes.status()).toBe(wrongPassRes.status());
    });
  });
};

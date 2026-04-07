import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { emailValidationScenarios } from "../../../../helpers/shared/validation.helper.js";
import { adminLogin } from "../auth.helpers.js";

export const loginValidationSuites = () => {
  test.describe("2. Email Validation", () => {
    emailValidationScenarios.forEach((scenario) => {
      test(`AL-E${scenario.id.split("-").pop()?.padStart(3, "0")}: 422 — Email: ${scenario.note}`, async ({
        api,
      }) => {
        const res = await adminLogin(api, {
          email: scenario.value,
          password: "ValidAdminPass123!",
        });

        expect(
          res.status(),
          `Expected 422 for email scenario: ${scenario.note}`,
        ).toBe(422);

        const body = await res.json();
        expect(body).toHaveProperty("errors");
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors.some((e: any) => e.field === "email")).toBe(true);
      });
    });
  });

  test.describe("4. Credential & Business Logic Errors", () => {
    test("AL-011: 422 — non-existent admin", async ({ api }) => {
      const res = await adminLogin(api, {
        email: "nonexistent.admin@company.com",
        password: "AnyPass123!",
      });

      expect(res.status()).toBe(422);

      const body = await res.json();
      expect(body.message).toMatch(
        /not found|invalid credentials|invalid email or password/i,
      );
    });

    test("AL-012: 422 — wrong password for existing admin", async ({
      createAdminUser,
      api,
    }) => {
      const admin = await createAdminUser();

      const res = await adminLogin(api, {
        email: admin.email,
        password: "CompletelyWrongPassword999!",
      });

      expect(res.status()).toBe(422);

      const body = await res.json();
      expect(body.message).toMatch(
        /invalid credentials|wrong password|invalid email or password/i,
      );
    });

    test("AL-013: 422 — missing password field", async ({ api }) => {
      const res = await api.post(`${ENDPOINTS.ADMIN_LOGIN}?lang=en`, {
        data: { email: "admin@test.com" },
      });
      expect(res.status()).toBe(422);

      const body = await res.json();
      expect(Array.isArray(body.errors)).toBe(true);
      expect(body.errors.some((e: any) => e.field === "password")).toBe(true);
    });
  });
};

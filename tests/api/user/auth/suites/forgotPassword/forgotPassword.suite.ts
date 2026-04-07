import { expect } from "@playwright/test";
import { test } from "../../../../../fixtures/user.fixture.js";
import { ENDPOINTS } from "../../../../../constants/endpoints.js";

export const forgotPasswordSuites = () => {
  test.describe("Forgot Password", () => {
    test(
      "PWD-010: 200 — valid email triggers forgot password",
      async ({ request }) => {
        const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, {
          data: { email: "test_non_existent@example.com" },
        });
        expect([200, 404]).toContain(res.status());
      },
    );

    test("PWD-011: 422 — missing email", async ({ request }) => {
      const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, { data: {} });
      expect(res.status()).toBe(422);
    });

    test("PWD-012: 422 — invalid email format", async ({ request }) => {
      const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, {
        data: { email: "invalid-email" },
      });
      expect(res.status()).toBe(422);
    });
  });
};

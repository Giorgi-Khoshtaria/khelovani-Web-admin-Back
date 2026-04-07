import { expect } from "@playwright/test";
import { test } from "../../../../../fixtures/user.fixture.js";
import { ENDPOINTS } from "../../../../../constants/endpoints.js";

export const resetPasswordSuites = () => {
  test.describe("Reset Password", () => {
    test("PWD-020: 422 — missing token", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: { password: "NewStrongPassword123!" },
      });
      expect([400, 422]).toContain(res.status());
    });

    test("PWD-021: 422 — missing password", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: { token: "dummy_token" },
      });
      expect([400, 422]).toContain(res.status());
    });

    test("PWD-022: 400 — invalid or expired token", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: {
          token: "dummy_token",
          password: "NewStrongPassword123!",
        },
      });
      expect([400, 401, 404]).toContain(res.status());
    });

    test("PWD-023: 422 — password too short", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: {
          token: "dummy_token",
          password: "123",
        },
      });
      expect([400, 422]).toContain(res.status());
    });
  });
};

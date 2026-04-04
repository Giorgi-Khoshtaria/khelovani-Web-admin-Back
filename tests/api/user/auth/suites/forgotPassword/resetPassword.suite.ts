import {
  test,
  expect,
  UserFixtures,
} from "../../../../../fixtures/auth.fixture.js";
import { ENDPOINTS } from "../../../../../constants/endpoints.js";

export const resetPasswordSuites = () => {
  test.describe("Reset Password", () => {
    test("PWD-020: 422 — missing token", async ({ api }: UserFixtures) => {
      const res = await api.post(ENDPOINTS.RESET_PASSWORD, {
        data: { password: "NewStrongPassword123!" },
      });
      expect([400, 422]).toContain(res.status());
    });

    test("PWD-021: 422 — missing password", async ({ api }: UserFixtures) => {
      const res = await api.post(ENDPOINTS.RESET_PASSWORD, {
        data: { token: "dummy_token" },
      });
      expect([400, 422]).toContain(res.status());
    });

    test("PWD-022: 400 — invalid or expired token", async ({
      api,
    }: UserFixtures) => {
      const res = await api.post(ENDPOINTS.RESET_PASSWORD, {
        data: {
          token: "dummy_token",
          password: "NewStrongPassword123!",
        },
      });
      expect([400, 401, 404]).toContain(res.status()); // Depends on backend implementation
    });

    test("PWD-023: 422 — password too short", async ({ api }: UserFixtures) => {
      const res = await api.post(ENDPOINTS.RESET_PASSWORD, {
        data: {
          token: "dummy_token",
          password: "123", // Too short
        },
      });
      expect([400, 422]).toContain(res.status());
    });
  });
};

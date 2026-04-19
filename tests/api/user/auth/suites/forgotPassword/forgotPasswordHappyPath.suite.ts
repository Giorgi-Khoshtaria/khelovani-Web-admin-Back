import { expect } from "@playwright/test";
import { test } from "../../../../../fixtures/user.fixture.js";
import { ENDPOINTS } from "../../../../../constants/endpoints.js";

const BYPASS = { "x-test-bypass": "khelovani-test-2026" };

export const forgotPasswordHappyPathSuites = () => {
  test.describe("1. Happy Path (200)", () => {
    test("FPW-001: 200 — valid email format triggers flow", async ({ request }) => {
      const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, {
        data: { email: "nonexistent_user@example.com" },
        headers: BYPASS,
      });
      expect(res.status()).toBe(200);
    });

    test("FPW-002: 200 — response has non-empty message field", async ({ request }) => {
      const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, {
        data: { email: "nonexistent_user@example.com" },
        headers: BYPASS,
      });
      const body = await res.json();
      expect(typeof body.message).toBe("string");
      expect(body.message.length).toBeGreaterThan(0);
    });
  });
};

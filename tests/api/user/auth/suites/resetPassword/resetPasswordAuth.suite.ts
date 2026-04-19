import { expect } from "@playwright/test";
import { test } from "../../../../../fixtures/user.fixture.js";
import { ENDPOINTS } from "../../../../../constants/endpoints.js";

const BYPASS = { "x-test-bypass": "khelovani-test-2026" };
const VALID_PASSWORD = "NewStrongPassword123!";

export const resetPasswordAuthSuites = () => {
  test.describe("2. Auth Failure (400/401/404)", () => {
    test("RST-030: 400 — invalid token fails JWT verification", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: { token: "dummy_invalid_token", password: VALID_PASSWORD },
        headers: BYPASS,
      });
      expect([400, 401, 404]).toContain(res.status());
    });

    test("RST-031: 400 — structurally valid JWT but wrong signature", async ({ request }) => {
      const fakeJwt = "eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20ifQ.invalidsignature";
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: { token: fakeJwt, password: VALID_PASSWORD },
        headers: BYPASS,
      });
      expect([400, 401]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });
  });
};

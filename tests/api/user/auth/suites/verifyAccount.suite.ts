import { expect } from "@playwright/test";
import { test } from "../../../../fixtures/user.fixture.js";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import jwt from "jsonwebtoken";

export const verifyAccountSuites = () => {
  test.describe("Verify Account", () => {
    test("VER-001: 400 — missing token in query", async ({ request }) => {
      const res = await request.get(ENDPOINTS.VERIFY);
      expect([400, 422]).toContain(res.status());
    });

    test("VER-002: 400 — invalid or expired token", async ({ request }) => {
      const res = await request.get(
        `${ENDPOINTS.VERIFY}?token=invalid_dummy_token`,
      );
      expect([400, 401, 404]).toContain(res.status());
    });

    test("VER-005: 200 — valid verification flow", async ({
      registerUnverifiedUser,
      request,
    }) => {
      const u = await registerUnverifiedUser();
      // Manually sign a token for the test user email
      const token = jwt.sign({ email: u.email }, process.env.JWT_SECRET!);

      const res = await request.get(`${ENDPOINTS.VERIFY}?token=${token}`);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.status).toBe("verified");

      // Verify second attempt returns 'already_verified'
      const res2 = await request.get(`${ENDPOINTS.VERIFY}?token=${token}`);
      expect(res2.status()).toBe(200);
      const body2 = await res2.json();
      expect(body2.status).toBe("already_verified");
    });
  });
};

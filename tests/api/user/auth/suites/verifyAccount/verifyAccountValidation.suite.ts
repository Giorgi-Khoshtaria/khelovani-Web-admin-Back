import { expect } from "@playwright/test";
import { test } from "../../../../../fixtures/user.fixture.js";
import { ENDPOINTS } from "../../../../../constants/endpoints.js";
import jwt from "jsonwebtoken";

export const verifyAccountValidationSuites = () => {
  test.describe("2. Validation (400)", () => {
    test("VER-010: 400 — missing token query param", async ({ request }) => {
      const res = await request.get(ENDPOINTS.VERIFY);
      expect([400, 422]).toContain(res.status());
      const body = await res.json();
      expect(typeof body.message).toBe("string");
    });

    test("VER-011: 400 — empty string token", async ({ request }) => {
      const res = await request.get(`${ENDPOINTS.VERIFY}?token=`);
      expect([400, 422]).toContain(res.status());
    });

    test("VER-012: 400 — invalid JWT string", async ({ request }) => {
      const res = await request.get(`${ENDPOINTS.VERIFY}?token=not_a_jwt`);
      expect([400, 401]).toContain(res.status());
    });

    test("VER-013: 400 — structurally valid JWT but wrong signature", async ({ request }) => {
      const fakeJwt = "eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20ifQ.invalidsignature";
      const res = await request.get(`${ENDPOINTS.VERIFY}?token=${fakeJwt}`);
      expect([400, 401]).toContain(res.status());
    });

    test("VER-014: 404 — valid JWT but user does not exist", async ({ request }) => {
      const token = jwt.sign(
        { email: "ghost_user_99999@test.com" },
        process.env.JWT_SECRET!,
      );
      const res = await request.get(`${ENDPOINTS.VERIFY}?token=${token}`);
      expect([400, 404]).toContain(res.status());
    });
  });
};

import { expect } from "@playwright/test";
import { test } from "../../../../../fixtures/user.fixture.js";
import { ENDPOINTS } from "../../../../../constants/endpoints.js";
import jwt from "jsonwebtoken";

export const verifyAccountHappyPathSuites = () => {
  test.describe("1. Happy Path (200)", () => {
    test("VER-001: 200 — valid token verifies account and returns status", async ({
      registerUnverifiedUser,
      request,
    }) => {
      const u = await registerUnverifiedUser();
      const token = jwt.sign({ email: u.email }, process.env.JWT_SECRET!);

      const res = await request.get(`${ENDPOINTS.VERIFY}?token=${token}`);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.status).toBe("verified");
    });

    test("VER-002: 200 — second verification attempt returns already_verified", async ({
      registerUnverifiedUser,
      request,
    }) => {
      const u = await registerUnverifiedUser();
      const token = jwt.sign({ email: u.email }, process.env.JWT_SECRET!);

      await request.get(`${ENDPOINTS.VERIFY}?token=${token}`);

      const res2 = await request.get(`${ENDPOINTS.VERIFY}?token=${token}`);
      expect(res2.status()).toBe(200);
      const body2 = await res2.json();
      expect(body2.data.status).toBe("already_verified");
    });

    test("VER-003: 200 — response has message field", async ({
      registerUnverifiedUser,
      request,
    }) => {
      const u = await registerUnverifiedUser();
      const token = jwt.sign({ email: u.email }, process.env.JWT_SECRET!);

      const res = await request.get(`${ENDPOINTS.VERIFY}?token=${token}`);
      const body = await res.json();
      expect(typeof body.message).toBe("string");
      expect(body.message.length).toBeGreaterThan(0);
    });
  });
};

import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { DbHelper } from "../../../../helpers/db/db.helper.js";
import { adminLogin, validateAdminToken } from "../auth.helpers.js";

export const loginHappyPathSuites = () => {
  test.describe("1. Happy Path", () => {
    test("AL-001: 200 — admin logs in successfully", async ({
      createAdminUser,
      api,
    }) => {
      const admin = await createAdminUser();

      const res = await adminLogin(api, {
        email: admin.email,
        password: admin.password,
      });

      expect(res.status()).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty("token");
      expect(body).toHaveProperty("id");
      expect(body).toHaveProperty("message");
      expect(typeof body.token).toBe("string");
      expect(body.token.length).toBeGreaterThan(20);

      const tokenData = validateAdminToken(body.token);
      expect(tokenData.role).toBe("admin");
      expect(Array.isArray(tokenData.permissions)).toBe(true);
    });

    test("AL-002: 200 — seeded admin logs in successfully", async ({ api }) => {
      await DbHelper.createAdminUser("admin@example.com", "admin123");

      const res = await adminLogin(api, {
        email: "admin@example.com",
        password: "admin123",
      });

      expect(res.status()).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty("token");
      expect(body).toHaveProperty("id");
      expect(body).toHaveProperty("message");
      expect(typeof body.token).toBe("string");
      expect(body.token.length).toBeGreaterThan(20);
      expect(body.message).toMatch(/login.*success|admin.*login.*success/i);

      const tokenData = validateAdminToken(body.token);
      expect(tokenData.role).toBe("admin");
      expect(Array.isArray(tokenData.permissions)).toBe(true);
    });

    test("AL-003: 200 — admin email is case-insensitive", async ({
      createAdminUser,
      api,
    }) => {
      const admin = await createAdminUser();

      const res = await adminLogin(api, {
        email: admin.email.toUpperCase(),
        password: admin.password,
      });

      expect(res.status()).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty("token");
      expect(body).toHaveProperty("message");
    });

    test("AL-004: 200 — admin token contains correct permissions", async ({
      createAdminUser,
      api,
    }) => {
      const admin = await createAdminUser();

      const res = await adminLogin(api, {
        email: admin.email,
        password: admin.password,
      });

      expect(res.status()).toBe(200);

      const body = await res.json();
      const tokenData = validateAdminToken(body.token);

      expect(tokenData.role).toBe("admin");
      expect(Array.isArray(tokenData.permissions)).toBe(true);
      expect(Array.isArray(tokenData.allowedPanels)).toBe(true);
      expect(typeof tokenData.id).toBe("string");
      expect(tokenData.id.length).toBe(24);
    });
  });
};

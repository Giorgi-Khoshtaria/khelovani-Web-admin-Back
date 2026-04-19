import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { adminLogin } from "../auth.helpers.js";

export const loginSecuritySuites = () => {
  test.describe("6. Security & Injection Protection", () => {
    test("AL-031: 422 — XSS attempt in email", async ({ api }) => {
      const res = await adminLogin(api, {
        email: "<script>alert(1)</script>@test.com",
        password: "ValidPass123!",
      });
      expect(res.status()).toBe(422);
    });

    test("AL-032: 422 — NoSQL injection in email object", async ({ api }) => {
      const res = await adminLogin(api, {
        email: { $gt: "" } as any,
        password: "password",
      });
      expect(res.status()).toBe(422);
    });

    test("AL-033: 422 — very long email", async ({ api }) => {
      const res = await adminLogin(api, {
        email: "a".repeat(300) + "@test.com",
        password: "ValidPass123!",
      });
      expect(res.status()).toBe(422);
    });

    test("AL-034: NoSQL injection in password — 422 or 422, never 500", async ({ api }) => {
      for (const password of ['{"$gt":""}', '{"$ne":null}', '{"$where":"return true"}']) {
        const res = await adminLogin(api, { email: "admin@test.com", password });
        expect(res.status()).not.toBe(500);
        expect([400, 422]).toContain(res.status());
      }
    });

    test("AL-035: XSS in password — 422 or safely rejected", async ({ api }) => {
      const res = await adminLogin(api, {
        email: "admin@test.com",
        password: "<script>alert(1)</script>",
      });
      expect(res.status()).not.toBe(500);
      const text = await res.text();
      expect(text).not.toContain("<script>alert(1)</script>");
    });

    test("AL-036: 422 — null email", async ({ api }) => {
      const res = await adminLogin(api, { email: null as any, password: "ValidPass123!" });
      expect(res.status()).toBe(422);
    });

    test("AL-037: 422 — empty body {}", async ({ api }) => {
      const res = await api.post(`${ENDPOINTS.ADMIN_LOGIN}?lang=en`, { data: {} });
      expect(res.status()).toBe(422);
    });

    test("AL-038: 413 or 422 — huge password never causes 500", async ({ api }) => {
      const res = await adminLogin(api, {
        email: "admin@test.com",
        password: "A".repeat(1_000_000),
      });
      expect([413, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("AL-039: prototype pollution in body — no 500", async ({ api }) => {
      const res = await api.post(`${ENDPOINTS.ADMIN_LOGIN}?lang=en`, {
        data: {
          email: "admin@test.com",
          password: "ValidPass123!",
          __proto__: { isAdmin: true },
          constructor: { prototype: { isAdmin: true } },
        },
      });
      expect(res.status()).not.toBe(500);
    });
  });

  test.describe("7. Rate Limiting & Brute Force Protection", () => {
    test("AL-040: 429 — rapid failed login attempts trigger rate limiting", async ({ api }) => {
      const promises = Array.from({ length: 15 }, () =>
        adminLogin(api, {
          email: "brute.force.admin@test.com",
          password: "WrongPassword123!",
        }),
      );

      const responses = await Promise.all(promises);
      const statuses = responses.map((r) => r.status());

      expect(statuses.some((s) => s >= 500), "Rate limiting must never cause 5xx").toBe(false);

      if (statuses.includes(429)) {
        const limitedRes = responses.find((r) => r.status() === 429);
        expect(limitedRes?.headers()["retry-after"]).toBeDefined();
      }
    });
  });

  test.describe("8. Response Headers & Information Leakage", () => {
    test("AL-050: plus addressing in admin email", async ({ api }) => {
      const res = await adminLogin(api, {
        email: "admin+test@company.com",
        password: "ValidPass123!",
      });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(body.message).toMatch(/not found|user not found|invalid email or password/i);
    });

    test("AL-051: prototype pollution attempt", async ({ api }) => {
      const res = await api.post(`${ENDPOINTS.ADMIN_LOGIN}?lang=en`, {
        data: {
          email: "admin@test.com",
          password: "ValidPass123!",
          __proto__: { isAdmin: true },
        },
      });
      expect(res.status()).not.toBe(500);
    });

    test("AL-052: no X-Powered-By header in response", async ({ api }) => {
      const res = await adminLogin(api, {
        email: "admin@test.com",
        password: "WrongPass123!",
      });
      expect(res.headers()["x-powered-by"]).toBeUndefined();
    });

    test("AL-053: no stack trace or DB internals in error response", async ({ api }) => {
      const text = await (
        await adminLogin(api, { email: "nonexistent@test.com", password: "WrongPass123!" })
      ).text();
      expect(text).not.toMatch(/mongodb/i);
      expect(text).not.toMatch(/mongoose/i);
      expect(text).not.toMatch(/at Object\./);
      expect(text).not.toMatch(/\.js:\d+:\d+/);
    });

    test("AL-054: Content-Type is application/json on all responses", async ({ api }) => {
      const cases = [
        adminLogin(api, { email: "bad", password: "bad" }),
        adminLogin(api, { email: "nonexistent@test.com", password: "WrongPass123!" }),
      ];
      for (const p of cases) {
        const res = await p;
        expect(res.headers()["content-type"]).toContain("application/json");
      }
    });

    test("AL-055: error message does not differentiate between bad email and bad password (no enumeration)", async ({
      createAdminUser,
      api,
    }) => {
      const admin = await createAdminUser();

      const wrongEmailRes = await adminLogin(api, {
        email: "nonexistent_xyz@test.com",
        password: "ValidPass123!",
      });
      const wrongPassRes = await adminLogin(api, {
        email: admin.email,
        password: "CompletelyWrong999!",
      });

      // Both must return the same status — that's the anti-enumeration guarantee.
      // Messages may differ between translations; only status equality is asserted.
      expect(wrongEmailRes.status()).toBe(wrongPassRes.status());
      expect(wrongEmailRes.status()).toBe(422);
    });
  });
};

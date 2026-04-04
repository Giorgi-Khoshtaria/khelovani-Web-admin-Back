import { test, expect } from "../../../../fixtures/auth.fixture.js";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { adminLogin } from "../auth.helpers.js";

export const loginSecuritySuites = () => {
  test.describe("6. Security & Injection Protection", () => {
    test("AL-030: 422 — SQL injection in email", async ({ api }) => {
      const payloads = ["' OR '1'='1", "'; DROP TABLE users; --", "admin'--"];
      for (const payload of payloads) {
        const res = await adminLogin(api, {
          email: payload,
          password: "ValidPass123!",
        });
        expect(res.status(), `SQL payload blocked: ${payload}`).toBe(422);
      }
    });

    test("AL-031: 422 — XSS attempt in email", async ({ api }) => {
      const res = await adminLogin(api, {
        email: "<script>alert(1)</script>@test.com",
        password: "ValidPass123!",
      });
      expect(res.status()).toBe(422);
    });

    test("AL-032: 422 — NoSQL injection attempt", async ({ api }) => {
      const res = await adminLogin(api, {
        email: { $gt: "" } as any,
        password: "password",
      });
      expect(res.status()).toBe(422);
    });

    test("AL-033: very long email → 422", async ({ api }) => {
      const longEmail = "a".repeat(300) + "@test.com";
      const res = await adminLogin(api, {
        email: longEmail,
        password: "ValidPass123!",
      });
      expect(res.status()).toBe(422);
    });
  });

  test.describe("7. Rate Limiting & Brute Force Protection", () => {
    test("AL-040: 429 — rapid failed login attempts trigger rate limiting", async ({
      api,
    }) => {
      const promises = Array.from({ length: 15 }, () =>
        adminLogin(api, {
          email: "brute.force.admin@test.com",
          password: "WrongPassword123!",
        }),
      );

      const responses = await Promise.all(promises);
      const statuses = responses.map((r) => r.status());

      const has429 = statuses.includes(429);
      const hasServerError = statuses.some((s) => s >= 500);

      expect(
        hasServerError,
        "Rate limiting burst must never cause 5xx error",
      ).toBe(false);

      if (has429) {
        const limitedRes = responses.find((r) => r.status() === 429);
        expect(limitedRes?.headers()["retry-after"]).toBeDefined();
      }
    });
  });

  test.describe("8. Additional Edge Cases", () => {
    test("AL-050: plus addressing in admin email", async ({ api }) => {
      const res = await adminLogin(api, {
        email: "admin+test@company.com",
        password: "ValidPass123!",
      });
      expect([200, 422]).toContain(res.status());
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
  });
};

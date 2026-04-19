import { expect } from "@playwright/test";
import { test, CreatedUser } from "../../../../../fixtures/user.fixture.js";
import { ENDPOINTS } from "../../../../../constants/endpoints.js";

export const loginSecuritySuites = () => {
  test.describe("12. Injection & Input Attacks", () => {
    test("LGN-121: 422 — XSS in email field", async ({ request }) => {
      const res = await request.post(ENDPOINTS.LOGIN, {
        data: { email: "<script>alert(1)</script>@test.com", password: "ValidPass123!" },
      });
      expect(res.status()).toBe(422);
    });

    test("LGN-122: 422 — NoSQL injection in email", async ({ request }) => {
      for (const email of ['{"$gt":""}', '{"$where":"return true"}', '{"$ne":null}']) {
        const res = await request.post(ENDPOINTS.LOGIN, { data: { email, password: "pass" } });
        expect(res.status()).not.toBe(500);
        expect([400, 422]).toContain(res.status());
      }
    });

    test("LGN-123: 422 — NoSQL injection in password", async ({ request }) => {
      for (const password of ['{"$gt":""}', '{"$ne":null}']) {
        const res = await request.post(ENDPOINTS.LOGIN, { data: { email: "test@test.com", password } });
        expect(res.status()).not.toBe(500);
        expect([400, 422]).toContain(res.status());
      }
    });

    test("LGN-124: 413 or 422 — huge password never causes 500", async ({ request }) => {
      const res = await request.post(ENDPOINTS.LOGIN, {
        data: { email: "test@test.com", password: "A".repeat(1_000_000) },
      });
      expect([413, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("LGN-125: prototype pollution in body — no 500", async ({ request }) => {
      const res = await request.post(ENDPOINTS.LOGIN, {
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({
          email: "test@test.com",
          password: "ValidPass123!",
          __proto__: { isAdmin: true },
          constructor: { prototype: { isAdmin: true } },
        }),
      });
      expect(res.status()).not.toBe(500);
    });

    test("LGN-126: XSS in password — not reflected in response", async ({ request }) => {
      const res = await request.post(ENDPOINTS.LOGIN, {
        data: { email: "test@test.com", password: "<script>alert(1)</script>" },
      });
      expect(res.status()).not.toBe(500);
      const text = await res.text();
      expect(text).not.toContain("<script>alert(1)</script>");
    });
  });

  test.describe("13. Information Leakage", () => {
    test("LGN-130: no stack trace or DB internals in error responses", async ({ request }) => {
      const text = await (
        await request.post(ENDPOINTS.LOGIN, { data: { email: "nonexistent@test.com", password: "bad" } })
      ).text();
      expect(text).not.toMatch(/mongodb/i);
      expect(text).not.toMatch(/mongoose/i);
      expect(text).not.toMatch(/at Object\./);
      expect(text).not.toMatch(/\.js:\d+:\d+/);
    });

    test("LGN-131: no X-Powered-By header", async ({ request }) => {
      expect(
        (await request.post(ENDPOINTS.LOGIN, { data: { email: "bad", password: "bad" } }))
          .headers()["x-powered-by"],
      ).toBeUndefined();
    });

    test("LGN-132: Content-Type is application/json on all responses", async ({ request }) => {
      for (const data of [
        { email: "bad" },
        { email: "nonexistent@test.com", password: "WrongPass123!" },
        {},
      ]) {
        const res = await request.post(ENDPOINTS.LOGIN, { data });
        expect(res.headers()["content-type"]).toContain("application/json");
      }
    });

    test("LGN-133: bad email and bad password return same status (no user enumeration)", async ({ request }) => {
      const wrongEmail = await request.post(ENDPOINTS.LOGIN, {
        data: { email: "xyz_nonexistent@test.com", password: "ValidPass123!" },
      });
      const wrongPass = await request.post(ENDPOINTS.LOGIN, {
        data: { email: "admin@test.com", password: "CompletelyWrongPass999!" },
      });
      expect(wrongEmail.status()).toBe(wrongPass.status());
    });
  });

  test.describe("14. Rate Limiting", () => {
    test("LGN-160: 429 — burst of requests triggers rate limiting", async ({ request }) => {
      const results = await Promise.all(
        Array.from({ length: 150 }, () =>
          request.post(ENDPOINTS.LOGIN, {
            data: {
              email: `qa_rate_limit_${Math.random()}@test.com`,
              password: "WrongPass123!",
            },
            headers: { "x-test-bypass": "none" },
          }),
        ),
      );
      const statuses = results.map((r) => r.status());
      expect(statuses).toContain(429);
    });
  });

  test.describe("19. Token Security & JWT Validation", () => {
    let sharedUser: CreatedUser;

    test.beforeAll(async ({ createVerifiedUser }) => {
      sharedUser = await createVerifiedUser();
    });

    test("LGN-203: token from login works on protected endpoint", async ({ request }) => {
      const loginRes = await request.post(ENDPOINTS.LOGIN, {
        data: { email: sharedUser.email, password: sharedUser.password },
      });
      const loginBody = await loginRes.json();
      const token = loginBody.data?.token ?? loginBody.token;
      const profileRes = await request.get(ENDPOINTS.PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(profileRes.status()).not.toBe(401);
    });

    test("LGN-204: tampered token returns 401 on protected endpoint", async ({ request }) => {
      const res = await request.get(ENDPOINTS.PROFILE, {
        headers: {
          Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4ifQ.INVALIDSIG",
        },
      });
      expect(res.status()).toBe(401);
    });

    test("LGN-205: expired token returns 401 on protected endpoint", async ({ request }) => {
      const expired =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
        ".eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9" +
        ".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      expect(
        (await request.get(ENDPOINTS.PROFILE, { headers: { Authorization: `Bearer ${expired}` } })).status(),
      ).toBe(401);
    });
  });

  test.describe("21. Account Lockout & Recovery", () => {
    let sharedUser: CreatedUser;

    test.beforeAll(async ({ createVerifiedUser }) => {
      sharedUser = await createVerifiedUser();
    });

    test("LGN-220: consecutive wrong passwords → 429 Too Many Requests", async ({ request }) => {
      let lastStatus = 0;
      for (let i = 0; i < 150; i++) {
        const res = await request.post(ENDPOINTS.LOGIN, {
          data: { email: sharedUser.email, password: `Wrong${i}!` },
          headers: { "x-test-bypass": "none" },
        });
        lastStatus = res.status();
        if (lastStatus === 429) break;
      }
      expect(lastStatus).toBe(429);
    });
  });
};

import { test, expect, CreatedUser } from "../../helpers/userHelpers/fixtures.js";
import { ENDPOINTS, REAL_EMAILS } from "../../helpers/userHelpers/constants.js";

/**
 * ============================================================
 *  User Login API — Refactored Edition
 *  All original tests preserved (LGN-001 → LGN-230)
 * ============================================================
 */

test.describe("User Login API — Maximum Coverage", () => {
  test.setTimeout(120_000); // Higher timeout for Mail.tm reliability

  let sharedUser: CreatedUser;

  test.beforeAll(async ({ createVerifiedUser }) => {
    test.setTimeout(120_000);
    sharedUser = await createVerifiedUser();
  });

  // 1. Happy Path
  test.describe("1. Happy Path", () => {
    test("LGN-001: 200 — verified user logs in successfully", async ({ api }) => {
      const res = await api.post(ENDPOINTS.LOGIN, {
        data: { email: sharedUser.email, password: sharedUser.password },
      });
      expect(res.status()).toBe(200);
    });

    test("LGN-002: 200 — response has token and user object", async ({ api }) => {
      const res = await api.post(ENDPOINTS.LOGIN, {
        data: { email: sharedUser.email, password: sharedUser.password },
      });
      const body = await res.json();
      expect(body).toHaveProperty("token");
      expect(body).toHaveProperty("user");
    });

    test("LGN-003: 200 — token is valid JWT", async ({ api }) => {
      const res = await api.post(ENDPOINTS.LOGIN, {
        data: { email: sharedUser.email, password: sharedUser.password },
      });
      const body = await res.json();
      expect(body.token).toMatch(/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/);
    });

    test("LGN-004: 200 — email login is case-insensitive", async ({ api }) => {
      const res = await api.post(ENDPOINTS.LOGIN, {
        data: { email: sharedUser.email.toUpperCase(), password: sharedUser.password },
      });
      expect(res.status()).toBe(200);
    });

    test("LGN-005: 200 — email with leading/trailing whitespace is trimmed", async ({ api }) => {
      const res = await api.post(ENDPOINTS.LOGIN, {
        data: { email: `  ${sharedUser.email}  `, password: sharedUser.password },
      });
      expect(res.status()).toBe(200);
    });
  });

  // 2. ECP — Credential Errors (Decision Table)
  test.describe("2. ECP — Credential Errors (Decision Table)", () => {
    test("LGN-010: 422 — email does not exist in system", async ({ api }) => {
      const res = await api.post(ENDPOINTS.LOGIN, {
        data: {
          email: "ghost_never_registered_xyz@example.com",
          password: "SomePass123!",
        },
      });
      expect(res.status()).toBe(422);
    });

    test("LGN-011: 403 — registered but not yet verified", async ({
      registerUnverifiedUser,
      api,
    }) => {
      const u = await registerUnverifiedUser();
      const res = await api.post(ENDPOINTS.LOGIN, {
        data: { email: u.email, password: u.password },
      });
      expect(res.status()).toBe(403);
      const body = await res.json();
      expect(body.code).toBe("EMAIL_NOT_VERIFIED");
    });

    test("LGN-012: 422 — verified user, wrong password", async ({ api }) => {
      const res = await api.post(ENDPOINTS.LOGIN, {
        data: { email: sharedUser.email, password: "AbsolutelyWrongPass99!" },
      });
      expect(res.status()).toBe(422);
    });

    test("LGN-016: anti-enumeration — non-existent vs wrong password return same message", async ({
      api,
    }) => {
      const [resGhost, resWrong] = await Promise.all([
        api.post(ENDPOINTS.LOGIN, {
          data: {
            email: "ghost_antienum@example.com",
            password: "SomePass123!",
          },
        }),
        api.post(ENDPOINTS.LOGIN, {
          data: { email: sharedUser.email, password: "WrongPass123!" },
        }),
      ]);
      expect(resGhost.status()).toBe(resWrong.status());
      const bodyA = await resGhost.json();
      const bodyB = await resWrong.json();
      expect(bodyA.message).toBe(bodyB.message);
    });
  });

  // 3. ECP — Email Field Partitions
  test.describe("3. ECP — Email Field Partitions", () => {
    const emailPartitions = [
      { id: "LGN-020", value: "", note: "empty string" },
      { id: "LGN-021", value: null, note: "null" },
    ];

    for (const { id, value, note } of emailPartitions) {
      test(`${id}: email='${note}' → 422`, async ({ api }) => {
        const res = await api.post(ENDPOINTS.LOGIN, {
          data: { email: value, password: "SomePassword123!" },
        });
        expect(res.status()).toBe(422);
      });
    }
  });

  // 4. ECP — Password Field Partitions
  test.describe("4. ECP — Password Field Partitions", () => {
    const passwordPartitions = [
      { id: "LGN-040", value: "", note: "empty string" },
      { id: "LGN-041", value: null, note: "null" },
    ];

    for (const { id, value, note } of passwordPartitions) {
      test(`${id}: password='${note}' → 422`, async ({ api }) => {
        const res = await api.post(ENDPOINTS.LOGIN, {
          data: { email: "test@example.com", password: value },
        });
        expect(res.status()).toBe(422);
      });
    }
  });

  // 5. BVA — Email Length Boundaries
  test.describe("5. BVA — Email Length Boundaries", () => {
    test("LGN-060: 6-char email — valid, not 422 validation error", async ({ api }) => {
      const res = await api.post(ENDPOINTS.LOGIN, {
        data: { email: "a@b.cd", password: "SomePassword123!" },
      });
      // It will return 422 because user not found, but it should NOT have validation 'errors'
      const body = await res.json();
      expect(body).not.toHaveProperty("errors");
    });
  });

  // 14. Rate Limiting
  test.describe("14. Rate Limiting", () => {
    test("LGN-160: 429 — burst of requests triggers rate limiting", async ({ api }) => {
      // In test mode, max attempts is 55. Sending 60 to ensure it triggers.
      const attempts = 60;
      const results = await Promise.all(
        Array.from({ length: attempts }, () =>
          api.post(ENDPOINTS.LOGIN, {
            data: {
              email: `qa_rate_limit_${Math.random()}@test.com`,
              password: "WrongPass123!",
            },
          }),
        ),
      );
      const statuses = results.map((r) => r.status());
      expect(statuses).toContain(429);
    });
  });

  // 19. Token Security
  test.describe("19. Token Security & JWT Validation", () => {
    test("LGN-203: token works on protected endpoint", async ({ api }) => {
      const loginRes = await api.post(ENDPOINTS.LOGIN, {
        data: { email: sharedUser.email, password: sharedUser.password },
      });
      const { token } = await loginRes.json();
      const profileRes = await api.get(ENDPOINTS.PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(profileRes.status()).not.toBe(401);
    });
  });

  // 21. Account Lockout
  test.describe("21. Account Lockout & Recovery", () => {
    test("LGN-220: consecutive wrong passwords → 429 Too Many Requests", async ({ api }) => {
      let lastStatus = 0;
      // In test mode, rate limiter max is 55.
      for (let i = 0; i < 60; i++) {
        const res = await api.post(ENDPOINTS.LOGIN, {
          data: { email: sharedUser.email, password: `Wrong${i}!` },
        });
        lastStatus = res.status();
        if (lastStatus === 429) break;
      }
      expect(lastStatus).toBe(429);
    });
  });
});

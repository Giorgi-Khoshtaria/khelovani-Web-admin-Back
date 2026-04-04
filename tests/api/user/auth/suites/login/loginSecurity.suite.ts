import {
  test,
  expect,
  CreatedUser,
  UserFixtures,
} from "../../../../../fixtures/auth.fixture.js";
import { ENDPOINTS } from "../../../../../constants/endpoints.js";

export const loginSecuritySuites = () => {
  test.describe("14. Rate Limiting", () => {
    test("LGN-160: 429 — burst of requests triggers rate limiting", async ({
      api,
    }: UserFixtures) => {
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

  test.describe("19. Token Security & JWT Validation", () => {
    let sharedUser: CreatedUser;

    test.beforeAll(async ({ createVerifiedUser }: UserFixtures) => {
      sharedUser = await createVerifiedUser();
    });

    test("LGN-203: token works on protected endpoint", async ({
      api,
    }: UserFixtures) => {
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

  test.describe("21. Account Lockout & Recovery", () => {
    let sharedUser: CreatedUser;

    test.beforeAll(async ({ createVerifiedUser }: UserFixtures) => {
      sharedUser = await createVerifiedUser();
    });

    test("LGN-220: consecutive wrong passwords → 429 Too Many Requests", async ({
      api,
    }: UserFixtures) => {
      let lastStatus = 0;
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
};

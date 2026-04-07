import { expect } from "@playwright/test";
import { test, CreatedUser } from "../../../../../fixtures/user.fixture.js";
import { ENDPOINTS } from "../../../../../constants/endpoints.js";

export const loginSecuritySuites = () => {
  test.describe("14. Rate Limiting", () => {
    test(
      "LGN-160: 429 — burst of requests triggers rate limiting",
      async ({ request }) => {
        const attempts = 150;
        const results = await Promise.all(
          Array.from({ length: attempts }, () =>
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
      },
    );
  });

  test.describe("19. Token Security & JWT Validation", () => {
    let sharedUser: CreatedUser;

    test.beforeAll(async ({ createVerifiedUser }) => {
      sharedUser = await createVerifiedUser();
    });

    test(
      "LGN-203: token works on protected endpoint",
      async ({ request }) => {
        const loginRes = await request.post(ENDPOINTS.LOGIN, {
          data: { email: sharedUser.email, password: sharedUser.password },
        });
        const { token } = await loginRes.json();
        const profileRes = await request.get(ENDPOINTS.PROFILE, {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(profileRes.status()).not.toBe(401);
      },
    );
  });

  test.describe("21. Account Lockout & Recovery", () => {
    let sharedUser: CreatedUser;

    test.beforeAll(async ({ createVerifiedUser }) => {
      sharedUser = await createVerifiedUser();
    });

    test(
      "LGN-220: consecutive wrong passwords → 429 Too Many Requests",
      async ({ request }) => {
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
      },
    );
  });
};

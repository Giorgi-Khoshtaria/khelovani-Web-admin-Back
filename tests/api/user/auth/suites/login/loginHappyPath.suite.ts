import { test, CreatedUser } from "../../../../../fixtures/user.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../../constants/endpoints.js";

export const loginHappyPathSuites = () => {
  test.describe("1. Happy Path", () => {
    let sharedUser: CreatedUser;

    test.beforeAll(async ({ createVerifiedUser }) => {
      sharedUser = await createVerifiedUser();
    });

    test(
      "LGN-001: 200 — verified user logs in successfully",
      async ({ request }) => {
        const res = await request.post(ENDPOINTS.LOGIN, {
          data: { email: sharedUser.email, password: sharedUser.password },
        });
        expect(res.status()).toBe(200);
      },
    );

    test(
      "LGN-002: 200 — response has token and user object",
      async ({ request }) => {
        const res = await request.post(ENDPOINTS.LOGIN, {
          data: { email: sharedUser.email, password: sharedUser.password },
        });
        const body = await res.json();
        expect(body.data).toHaveProperty("token");
        expect(body.data).toHaveProperty("user");
      },
    );

    test("LGN-003: 200 — token is valid JWT", async ({ request }) => {
      const res = await request.post(ENDPOINTS.LOGIN, {
        data: { email: sharedUser.email, password: sharedUser.password },
      });
      const body = await res.json();
      expect(body.data.token).toMatch(
        /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/,
      );
    });

    test(
      "LGN-004: 200 — email login is case-insensitive",
      async ({ request }) => {
        const res = await request.post(ENDPOINTS.LOGIN, {
          data: {
            email: sharedUser.email.toUpperCase(),
            password: sharedUser.password,
          },
        });
        expect(res.status()).toBe(200);
      },
    );

    test(
      "LGN-005: 200 — email with leading/trailing whitespace is trimmed",
      async ({ request }) => {
        const res = await request.post(ENDPOINTS.LOGIN, {
          data: {
            email: `  ${sharedUser.email}  `,
            password: sharedUser.password,
          },
        });
        expect(res.status()).toBe(200);
      },
    );
  });
};

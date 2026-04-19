import { expect } from "@playwright/test";
import { test, CreatedUser } from "../../../../../fixtures/user.fixture.js";
import { ENDPOINTS } from "../../../../../constants/endpoints.js";

export const loginValidationSuites = () => {
  test.describe("2. ECP — Credential Errors", () => {
    let sharedUser: CreatedUser;

    test.beforeAll(async ({ createVerifiedUser }) => {
      sharedUser = await createVerifiedUser();
    });

    test(
      "LGN-010: 422 — email does not exist in system",
      async ({ request }) => {
        const res = await request.post(ENDPOINTS.LOGIN, {
          data: {
            email: "ghost_never_registered_xyz@example.com",
            password: "SomePass123!",
          },
          headers: { "x-test-bypass": "khelovani-test-2026" },
        });
        expect(res.status()).toBe(422);
      },
    );

    test(
      "LGN-011: 403 — registered but not yet verified",
      async ({ registerUnverifiedUser, request }) => {
        const u = await registerUnverifiedUser();
        const res = await request.post(ENDPOINTS.LOGIN, {
          data: { email: u.email, password: u.password },
          headers: { "x-test-bypass": "khelovani-test-2026" },
        });
        expect(res.status()).toBe(403);
        const body = await res.json();
        expect(body.data?.code ?? body.code).toBe("EMAIL_NOT_VERIFIED");
      },
    );

    test(
      "LGN-012: 422 — verified user, wrong password",
      async ({ request }) => {
        const res = await request.post(ENDPOINTS.LOGIN, {
          data: { email: sharedUser.email, password: "AbsolutelyWrongPass99!" },
          headers: { "x-test-bypass": "khelovani-test-2026" },
        });
        expect(res.status()).toBe(422);
      },
    );

    test(
      "LGN-016: anti-enumeration — non-existent vs wrong password return same message",
      async ({ request }) => {
        const [resGhost, resWrong] = await Promise.all([
          request.post(ENDPOINTS.LOGIN, {
            data: {
              email: "ghost_antienum@example.com",
              password: "SomePass123!",
            },
          }),
          request.post(ENDPOINTS.LOGIN, {
            data: { email: sharedUser.email, password: "WrongPass123!" },
          }),
        ]);
        expect(resGhost.status()).toBe(resWrong.status());
        const bodyA = await resGhost.json();
        const bodyB = await resWrong.json();
        expect(bodyA.message).toBe(bodyB.message);
      },
    );
  });

  test.describe("3. ECP — Email Field Partitions", () => {
    const emailPartitions = [
      { id: "LGN-020", value: "", note: "empty string" },
      { id: "LGN-021", value: null as any, note: "null" },
    ];

    for (const { id, value, note } of emailPartitions) {
  test(`${id}: email='${note}' → 422`, async ({ request }) => {
        const res = await request.post(ENDPOINTS.LOGIN, {
          data: { email: value, password: "SomePassword123!" },
          headers: { "x-test-bypass": "khelovani-test-2026" },
        });
        expect(res.status()).toBe(422);
      });
    }
  });

  test.describe("4. ECP — Password Field Partitions", () => {
    const passwordPartitions = [
      { id: "LGN-040", value: "", note: "empty string" },
      { id: "LGN-041", value: null as any, note: "null" },
    ];

    for (const { id, value, note } of passwordPartitions) {
      test(`${id}: password='${note}' → 422`, async ({ request }) => {
        const res = await request.post(ENDPOINTS.LOGIN, {
          data: { email: "test@example.com", password: value },
          headers: { "x-test-bypass": "khelovani-test-2026" },
        });
        expect(res.status()).toBe(422);
      });
    }
  });

  test.describe("5. BVA — Email Length Boundaries", () => {
    test(
      "LGN-060: 6-char email — valid, not 422 validation error",
      async ({ request }) => {
        const res = await request.post(ENDPOINTS.LOGIN, {
          data: { email: "a@b.cd", password: "SomePassword123!" },
        });
        const body = await res.json();
        expect(body).not.toHaveProperty("errors");
      },
    );
  });
};

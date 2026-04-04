import {
  test,
  expect,
  CreatedUser,
  UserFixtures,
} from "../../../../../fixtures/auth.fixture.js";
import { ENDPOINTS } from "../../../../../constants/endpoints.js";

export const loginValidationSuites = () => {
  test.describe("2. ECP — Credential Errors", () => {
    let sharedUser: CreatedUser;

    test.beforeAll(async ({ createVerifiedUser }: UserFixtures) => {
      sharedUser = await createVerifiedUser();
    });

    test("LGN-010: 422 — email does not exist in system", async ({
      api,
    }: UserFixtures) => {
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
    }: UserFixtures) => {
      const u = await registerUnverifiedUser();
      const res = await api.post(ENDPOINTS.LOGIN, {
        data: { email: u.email, password: u.password },
      });
      expect(res.status()).toBe(403);
      const body = await res.json();
      expect(body.code).toBe("EMAIL_NOT_VERIFIED");
    });

    test("LGN-012: 422 — verified user, wrong password", async ({
      api,
    }: UserFixtures) => {
      const res = await api.post(ENDPOINTS.LOGIN, {
        data: { email: sharedUser.email, password: "AbsolutelyWrongPass99!" },
      });
      expect(res.status()).toBe(422);
    });

    test("LGN-016: anti-enumeration — non-existent vs wrong password return same message", async ({
      api,
    }: UserFixtures) => {
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

  test.describe("3. ECP — Email Field Partitions", () => {
    const emailPartitions = [
      { id: "LGN-020", value: "", note: "empty string" },
      { id: "LGN-021", value: null as any, note: "null" },
    ];

    for (const { id, value, note } of emailPartitions) {
      test(`${id}: email='${note}' → 422`, async ({ api }: UserFixtures) => {
        const res = await api.post(ENDPOINTS.LOGIN, {
          data: { email: value, password: "SomePassword123!" },
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
      test(`${id}: password='${note}' → 422`, async ({ api }: UserFixtures) => {
        const res = await api.post(ENDPOINTS.LOGIN, {
          data: { email: "test@example.com", password: value },
        });
        expect(res.status()).toBe(422);
      });
    }
  });

  test.describe("5. BVA — Email Length Boundaries", () => {
    test("LGN-060: 6-char email — valid, not 422 validation error", async ({
      api,
    }: UserFixtures) => {
      const res = await api.post(ENDPOINTS.LOGIN, {
        data: { email: "a@b.cd", password: "SomePassword123!" },
      });
      const body = await res.json();
      expect(body).not.toHaveProperty("errors");
    });
  });
};

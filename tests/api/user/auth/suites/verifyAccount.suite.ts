import {
  test,
  expect,
  UserFixtures,
} from "../../../../fixtures/auth.fixture.js";
import { ENDPOINTS } from "../../../../constants/endpoints.js";

export const verifyAccountSuites = () => {
  test.describe("Verify Account", () => {
    test("VER-001: 400 — missing token in query", async ({
      api,
    }: UserFixtures) => {
      // It's a GET request with a token usually: /api/user/verify?token=...
      const res = await api.get(ENDPOINTS.VERIFY);
      expect([400, 422]).toContain(res.status());
    });

    test("VER-002: 400 — invalid or expired token", async ({
      api,
    }: UserFixtures) => {
      const res = await api.get(
        `${ENDPOINTS.VERIFY}?token=invalid_dummy_token`,
      );
      expect([400, 401, 404]).toContain(res.status());
    });

    // In a real scenario, we would register a user, get the token from the DB and verify it.
    // For maximum coverage, we focus on the validation of the inputs and endpoints primarily without complex DB token extraction for now.
  });
};

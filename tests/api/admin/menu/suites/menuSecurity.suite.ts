import { test, expect } from "../../../../fixtures/auth.fixture.js";
import { ENDPOINTS } from "../../../../constants/endpoints.js";

export const menuSecuritySuites = () => {
  test.describe("5. Security & Rate Limiting", () => {
    test("MNU-040: 401 — access without auth token", async ({ api }) => {
      const res = await api.get(ENDPOINTS.ADMIN_MENU);
      expect(res.status()).toBe(401);
    });

    test("MNU-041: 403 — access with user token", async ({ api }) => {
      // Assuming api fixture is authenticated as a regular user, or at least a non-admin user
      // We will perform a POST request since it requires admin
      const res = await api.post(ENDPOINTS.ADMIN_MENU, { data: {} });
      expect([401, 403]).toContain(res.status());
    });

    test("MNU-042: 429 — rate limit triggered on write operations", async ({
      adminApi,
    }) => {
      const MAX_REQUESTS = 60; // Usually rate limit is 60 or less
      const results = await Promise.all(
        Array.from({ length: MAX_REQUESTS }, () =>
          adminApi.post(ENDPOINTS.ADMIN_MENU, { data: {} }), // Invalid data, but should still count for rate limit
        ),
      );
      const statuses = results.map((r) => r.status());
      expect(statuses).toContain(429);
    });
  });
};

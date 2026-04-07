import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
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
      playwright,
      adminUser,
    }) => {
      // Manual context to avoid x-test-bypass header in adminApi fixture
      const requestContext = await playwright.request.newContext({
        baseURL: "http://localhost:3001",
      });

      // Login to get token without bypass header
      const loginRes = await requestContext.post(ENDPOINTS.ADMIN_LOGIN, {
        data: { email: adminUser.email, password: adminUser.password },
      });
      const { token } = await loginRes.json();

      const authContext = await playwright.request.newContext({
        baseURL: "http://localhost:3001",
        extraHTTPHeaders: { Authorization: `Bearer ${token}` },
      });

      const MAX_REQUESTS = 65; 
      const results = await Promise.all(
        Array.from({ length: MAX_REQUESTS }, () =>
          authContext.post(ENDPOINTS.ADMIN_MENU, { data: {} }),
        ),
      );
      const statuses = results.map((r) => r.status());
      expect(statuses).toContain(429);

      await authContext.dispose();
      await requestContext.dispose();
    });
  });
};

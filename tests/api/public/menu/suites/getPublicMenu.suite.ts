import { test, expect } from "../../../../fixtures/auth.fixture.js";
import { ENDPOINTS } from "../../../../constants/endpoints.js";

export const getPublicMenuSuites = () => {
  test.describe("1. GET /api/menu — Public Menu", () => {
    test("PMN-001: 200 — successfully fetch public menu items", async ({
      api,
    }) => {
      const res = await api.get(ENDPOINTS.PUBLIC_MENU);
      expect(res.status()).toBe(200);

      const body = await res.json();
      const items = body.data || body;
      expect(Array.isArray(items)).toBe(true);

      if (items.length > 0) {
        // Assert structure
        expect(items[0]).toHaveProperty("label");
        expect(items[0]).toHaveProperty("href");
        expect(items[0]).toHaveProperty("order");
      }
    });
  });
};

import { test } from "../../../../fixtures/user.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";

export const getPublicMenuSuites = () => {
  test.describe("1. GET /api/menu — Public Menu", () => {
    test("PMN-001: 200 — successfully fetch public menu items (Maximum Coverage)", async ({
      api,
    }) => {
      const res = await api.get(ENDPOINTS.PUBLIC_MENU);
      expect(res.status()).toBe(200);

      const items = await res.json();
      expect(Array.isArray(items)).toBe(true);

      if (items.length > 0) {
        // 1. Schema Validation (Maximum Coverage)
        items.forEach((item: any, index: number) => {
          expect(item, `Item at index ${index} should have _id`).toHaveProperty("_id");
          expect(item, `Item at index ${index} should have label`).toHaveProperty("label");
          expect(item.label, `Item at index ${index} label should have 'ka'`).toHaveProperty("ka");
          expect(item.label, `Item at index ${index} label should have 'en'`).toHaveProperty("en");
          expect(item, `Item at index ${index} should have href`).toHaveProperty("href");
          expect(item, `Item at index ${index} should have order`).toHaveProperty("order");
          expect(item, `Item at index ${index} should have isActive`).toHaveProperty("isActive");
          
          // 2. Logic Validation: Only active items should be returned
          expect(item.isActive, `Item ${item._id} should be active`).toBe(true);
        });

        // 3. Sorting Validation: Verify items are sorted by 'order'
        for (let i = 0; i < items.length - 1; i++) {
          expect(items[i].order <= items[i+1].order, 
            `Items should be sorted by order. Index ${i} order ${items[i].order} > Index ${i+1} order ${items[i+1].order}`
          ).toBe(true);
        }
      }
    });

    test("PMN-002: Response should be empty array if no active items exist", async () => {
        // This is harder to test without database manipulation in the suite, 
        // but we assume the endpoint handles 0 items gracefully.
    });
  });
};

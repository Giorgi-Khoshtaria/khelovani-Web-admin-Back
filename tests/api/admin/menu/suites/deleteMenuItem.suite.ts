import { test, expect } from "../../../../fixtures/auth.fixture.js";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createMenuItem, deleteMenuItem } from "../menu.helpers.js";

export const deleteMenuItemSuites = () => {
  test.describe("4. DELETE /api/admin/menu/:id — Delete Menu Item", () => {
    test("MNU-030: 200 — successfully delete menu item", async ({ adminApi }) => {
      const { id } = await createMenuItem(adminApi);
      const res = await adminApi.delete(`${ENDPOINTS.ADMIN_MENU}/${id}`);
      expect(res.status()).toBe(200);

      // Verify deletion
      const getRes = await adminApi.get(ENDPOINTS.ADMIN_MENU);
      const array = (await getRes.json()).data || await getRes.json();
      expect(array.some((m: any) => m._id === id)).toBe(false);
    });

    test("MNU-031: 404 — delete non-existent menu item", async ({ adminApi }) => {
      const res = await adminApi.delete(
        `${ENDPOINTS.ADMIN_MENU}/000000000000000000000000`,
      );
      expect(res.status()).toBe(404);
    });

    test("MNU-032: 400 — delete with invalid ID format", async ({ adminApi }) => {
      const res = await adminApi.delete(`${ENDPOINTS.ADMIN_MENU}/invalid_id`);
      expect(res.status()).toBe(400);
    });
  });
};

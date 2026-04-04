import { test, expect } from "../../../../fixtures/auth.fixture.js";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createMenuItem, deleteMenuItem } from "../menu.helpers.js";

export const updateMenuItemSuites = () => {
  test.describe("3. PUT /api/admin/menu/:id — Update Menu Item", () => {
    test("MNU-020: 200 — partially update a menu item", async ({ adminApi }) => {
      const { id } = await createMenuItem(adminApi);
      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_MENU}/${id}`, {
          data: { href: "/updated-href" },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        const updated = body.data || body.menuItem || body;
        expect(updated.href).toBe("/updated-href");
      } finally {
        await deleteMenuItem(adminApi, id);
      }
    });

    test("MNU-021: 404 — update non-existent menu item", async ({ adminApi }) => {
      const res = await adminApi.put(
        `${ENDPOINTS.ADMIN_MENU}/000000000000000000000000`,
        { data: { href: "/updated" } },
      );
      expect(res.status()).toBe(404);
    });

    test("MNU-022: 400 — invalid ID format", async ({ adminApi }) => {
      const res = await adminApi.put(`${ENDPOINTS.ADMIN_MENU}/invalid_id`, {
        data: { href: "/updated" },
      });
      expect(res.status()).toBe(400);
    });
  });
};

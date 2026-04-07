import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createMenuItem, deleteMenuItem } from "../menu.helpers.js";

export const getMenuItemsSuites = () => {
  test.describe("2. GET /api/admin/menu — Get Menu Items", () => {
    test("MNU-010: 200 — get list of menu items", async ({ adminApi }) => {
      const { id } = await createMenuItem(adminApi);
      try {
        const res = await adminApi.get(ENDPOINTS.ADMIN_MENU);
        expect(res.status()).toBe(200);
        const body = await res.json();
        const menus = body.data || body;
        expect(Array.isArray(menus)).toBe(true);
        expect(menus.some((m: any) => m._id === id)).toBe(true);
      } finally {
        await deleteMenuItem(adminApi, id);
      }
    });
  });
};

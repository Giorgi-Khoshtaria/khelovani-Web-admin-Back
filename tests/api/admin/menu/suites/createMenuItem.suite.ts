import { test, expect } from "../../../../fixtures/auth.fixture.js";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createMenuItem, deleteMenuItem, VALID_MENU_ITEM } from "../menu.helpers.js";

export const createMenuItemSuites = () => {
  test.describe("1. POST /api/admin/menu — Create Menu Item", () => {
    test("MNU-001: 201 — create menu item with all valid fields", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, {
        data: VALID_MENU_ITEM,
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      const id = body._id || body.data?._id || body.menuItem?._id;
      expect(id).toBeDefined();
      await deleteMenuItem(adminApi, id);
    });

    test("MNU-002: 400 — empty request body", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, { data: {} });
      expect(res.status()).toBe(400);
    });

    test("MNU-003: 400 — missing label object", async ({ adminApi }) => {
      const { label, ...noLabel } = VALID_MENU_ITEM;
      const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, { data: noLabel });
      expect(res.status()).toBe(400);
    });

    test("MNU-004: 400 — missing href", async ({ adminApi }) => {
      const { href, ...noHref } = VALID_MENU_ITEM;
      const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, { data: noHref });
      expect(res.status()).toBe(400);
    });

    test("MNU-005: 422/400 — empty href string", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, {
        data: { ...VALID_MENU_ITEM, href: "" },
      });
      expect([400, 422]).toContain(res.status());
    });
  });
};

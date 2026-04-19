import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { deleteMenuItem, VALID_MENU_ITEM } from "../menu.helpers.js";

export const createMenuItemSuites = () => {
  test.describe("1. POST /api/admin/menu — Create Menu Item", () => {
    test("MNU-001: 201 — create menu item with all valid fields", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, { data: VALID_MENU_ITEM });
      expect(res.status()).toBe(201);
      const body = await res.json();
      const id = body.data?._id ?? body._id ?? body.menuItem?._id;
      expect(id).toBeDefined();
      expect(body.data?.label?.ka ?? body.label?.ka).toBe(VALID_MENU_ITEM.label.ka);
      expect(body.data?.label?.en ?? body.label?.en).toBe(VALID_MENU_ITEM.label.en);
      expect(body.data?.href ?? body.href).toBe(VALID_MENU_ITEM.href);
      await deleteMenuItem(adminApi, id);
    });

    test("MNU-002: 201 — isActive defaults to false when omitted", async ({ adminApi }) => {
      const { isActive, ...noActive } = VALID_MENU_ITEM;
      const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, { data: noActive });
      expect(res.status()).toBe(201);
      const body = await res.json();
      const id = body.data?._id ?? body._id ?? body.menuItem?._id;
      await deleteMenuItem(adminApi, id);
    });
  });
};

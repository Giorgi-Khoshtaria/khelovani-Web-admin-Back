import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { deleteMenuItem, VALID_MENU_ITEM } from "../menu.helpers.js";

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

    test("MNU-002: 422 — empty request body", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, { data: {} });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(Array.isArray(body.errors)).toBe(true);
    });

    test("MNU-003: 422 — missing label object", async ({ adminApi }) => {
      const { label, ...noLabel } = VALID_MENU_ITEM;
      const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, { data: noLabel });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(body.errors.some((e: any) => e.field === "label")).toBe(true);
    });

    test("MNU-004: 422 — missing href", async ({ adminApi }) => {
      const { href, ...noHref } = VALID_MENU_ITEM;
      const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, { data: noHref });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(body.errors.some((e: any) => e.field === "href")).toBe(true);
    });

    test("MNU-005: 422 — empty href string", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, {
        data: { ...VALID_MENU_ITEM, href: "" },
      });
      expect(res.status()).toBe(422);
    });
  });
};

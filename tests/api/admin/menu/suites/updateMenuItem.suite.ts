import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createMenuItem, deleteMenuItem } from "../menu.helpers.js";

export const updateMenuItemSuites = () => {
  test.describe("3. PUT /api/admin/menu/:id — Update Menu Item", () => {
    test("UPD-MNU-001: 200 — partially update href", async ({ adminApi }) => {
      const { id } = await createMenuItem(adminApi);
      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_MENU}/${id}`, {
          data: { href: "/updated-href" },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.data.href).toBe("/updated-href");
      } finally {
        await deleteMenuItem(adminApi, id);
      }
    });

    test("UPD-MNU-002: 200 — partially update label", async ({ adminApi }) => {
      const { id } = await createMenuItem(adminApi);
      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_MENU}/${id}`, {
          data: { label: { ka: "განახლება", en: "Updated" } },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.data?.label?.en ?? body.label?.en).toBe("Updated");
      } finally {
        await deleteMenuItem(adminApi, id);
      }
    });

    test("UPD-MNU-003: 404 — update non-existent menu item", async ({ adminApi }) => {
      const res = await adminApi.put(`${ENDPOINTS.ADMIN_MENU}/000000000000000000000000`, {
        data: { href: "/updated" },
      });
      expect(res.status()).toBe(404);
    });

    test("UPD-MNU-004: 422 — invalid ID format", async ({ adminApi }) => {
      const res = await adminApi.put(`${ENDPOINTS.ADMIN_MENU}/invalid_id`, {
        data: { href: "/updated" },
      });
      expect(res.status()).toBe(422);
    });

    test("UPD-MNU-005: 200 — update isActive to false", async ({ adminApi }) => {
      const { id } = await createMenuItem(adminApi);
      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_MENU}/${id}`, {
          data: { isActive: false },
        });
        expect(res.status()).toBe(200);
      } finally {
        await deleteMenuItem(adminApi, id);
      }
    });
  });
};

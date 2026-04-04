import { APIRequestContext } from "@playwright/test";
import { ENDPOINTS } from "../../../constants/endpoints.js";

export const VALID_MENU_ITEM = {
  label: { ka: "მთავარი", en: "Home" },
  href: "/home",
  order: 1,
  isActive: true,
};

export const createMenuItem = async (
  adminApi: APIRequestContext,
  overrides?: Record<string, any>,
) => {
  const payload = { ...VALID_MENU_ITEM, ...overrides };
  const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, { data: payload });
  if (res.status() !== 201) {
    throw new Error(`Failed to create menu item. Status: ${res.status()}`);
  }
  const body = await res.json();
  return { id: body._id || body.data?._id || body.menuItem?._id, payload, res };
};

export const deleteMenuItem = async (adminApi: APIRequestContext, id: string) => {
  if (id) {
    await adminApi.delete(`${ENDPOINTS.ADMIN_MENU}/${id}`);
  }
};

import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../constants/endpoints.js";
import { randomId } from "../../../helpers/utils/generators.js";

export const VALID_PERMISSION = {
  name: "", // always overridden per-test
  description: "QA test permission",
  category: "General",
};

/** Unique permission name — prevents cross-test collisions */
export const uniqueName = (prefix = "QA") => `${prefix}_${randomId()}`;

/**
 * Creates a permission and returns its id + name.
 * Throws if creation fails so callers don't silently proceed
 * with undefined ids.
 */
export async function createPermission(
  adminApi: any,
  overrides: Record<string, any> = {},
): Promise<{ id: string; name: string }> {
  const name = overrides.name ?? uniqueName();
  const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
    data: { ...VALID_PERMISSION, name, ...overrides },
  });

  if (res.status() !== 201) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      `createPermission failed (${res.status()}): ${JSON.stringify(body)}`,
    );
  }

  const body = await res.json();
  const id = body.permission?._id ?? body._id;

  if (!id) {
    throw new Error(
      `createPermission: no id in response: ${JSON.stringify(body)}`,
    );
  }
  return { id, name };
}

/** Delete a permission — used in afterEach cleanup */
export async function deletePermission(
  adminApi: any,
  id: string,
): Promise<void> {
  await adminApi.delete(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`).catch(() => {});
}

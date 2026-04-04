import { APIRequestContext } from "@playwright/test";
import { ENDPOINTS } from "../../../constants/endpoints.js";
import { randomId } from "../../../helpers/utils/generators.js";

// ─── Constants ───────────────────────────────────────────────

export const VALID_PANELS = ["admin", "admin-organization"];
export const SYSTEM_ROLES = ["admin"]; // roles that must never be deleted/renamed

export const VALID_ROLE = {
  name: "", // always overridden
  description: "QA test role",
  allowedPanels: ["admin"],
  permissions: [],
};

// ─── Helpers ─────────────────────────────────────────────────

export const uniqueName = (prefix = "QA_Role") => `${prefix}_${randomId()}`;

/**
 * Creates a role and returns its id + name.
 */
export async function createRole(
  adminApi: APIRequestContext,
  overrides: Record<string, any> = {},
): Promise<{ id: string; name: string }> {
  const name = overrides.name ?? uniqueName();
  const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
    data: { ...VALID_ROLE, name, ...overrides },
  });

  if (res.status() !== 201) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      `createRole failed (${res.status()}): ${JSON.stringify(body)}`,
    );
  }

  const body = await res.json();
  const id = body.role?._id ?? body._id;
  if (!id)
    throw new Error(`createRole: no id in response: ${JSON.stringify(body)}`);

  return { id, name };
}

/**
 * Creates a permission and returns its id.
 */
export async function createPermission(
  adminApi: APIRequestContext,
  overrides: Record<string, any> = {},
): Promise<{ id: string; name: string }> {
  const name = overrides.name ?? `QA_Perm_${randomId()}`;
  const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
    data: { name, description: "QA perm", category: "General", ...overrides },
  });

  if (res.status() !== 201) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      `createPermission failed (${res.status()}): ${JSON.stringify(body)}`,
    );
  }

  const body = await res.json();
  const id = body.permission?._id ?? body._id;
  if (!id)
    throw new Error(
      `createPermission: no id in response: ${JSON.stringify(body)}`,
    );

  return { id, name };
}

export async function deleteRole(adminApi: APIRequestContext, id: string): Promise<void> {
  await adminApi.delete(`${ENDPOINTS.ADMIN_ROLES}/${id}`).catch(() => {});
}

export async function deletePermission(adminApi: APIRequestContext, id: string): Promise<void> {
  await adminApi.delete(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`).catch(() => {});
}

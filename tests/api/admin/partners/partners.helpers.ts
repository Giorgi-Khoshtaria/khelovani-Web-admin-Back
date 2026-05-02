import { APIRequestContext } from "@playwright/test";
import { ENDPOINTS, DEFAULT_PARTNER } from "../../../constants/endpoints.js";
import { randomId } from "../../../helpers/utils/generators.js";

/**
 * Creates a fresh PENDING partner and returns its id + email.
 */
export async function createPendingPartner(
  api: APIRequestContext,
): Promise<{ id: string; email: string }> {
  const email = `qa_${randomId()}@test.com`;
  const identificationCode = randomId().slice(0, 9);

  const res = await api.post(ENDPOINTS.PARTNER_REGISTER, {
    data: { ...DEFAULT_PARTNER, email, identificationCode },
  });
  
  if (res.status() !== 201) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`createPendingPartner failed (${res.status()}): ${JSON.stringify(body)}`);
  }

  const body = await res.json();
  const id = body.data?.partner?._id ?? body.data?._id ?? body.partner?._id ?? body._id;

  if (!id) {
    throw new Error(
      `createPendingPartner: could not extract id.\nResponse: ${JSON.stringify(body)}`,
    );
  }
  return { id, email };
}

/**
 * Approves a partner via the admin status endpoint.
 */
export async function approvePartner(
  adminApi: APIRequestContext,
  id: string,
): Promise<void> {
  await adminApi.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`, {
    data: { status: "APPROVED" },
  });
}

/**
 * Pins or unpins a partner via the admin pin endpoint.
 */
export async function pinPartner(
  adminApi: APIRequestContext,
  id: string,
  isPinned: boolean,
) {
  return adminApi.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/pin`, {
    data: { isPinned },
  });
}

/**
 * Shows or hides a partner via the admin visibility endpoint.
 */
export async function setVisibility(
  adminApi: APIRequestContext,
  id: string,
  isShown: boolean,
) {
  return adminApi.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/visibility`, {
    data: { isShown },
  });
}

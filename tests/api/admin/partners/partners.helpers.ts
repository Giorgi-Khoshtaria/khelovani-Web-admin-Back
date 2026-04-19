import { APIRequestContext } from "@playwright/test";
import { ENDPOINTS, DEFAULT_PARTNER } from "../../../constants/endpoints.js";
import { randomId } from "../../../helpers/utils/generators.js";

/**
 * Creates a fresh PENDING partner and returns its id + email.
 * This helper uses the public registration endpoint.
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

import type { APIRequestContext } from "@playwright/test";
import { ENDPOINTS } from "../../../constants/endpoints.js";

/** A payment card payload that passes validation; override fields as needed. */
export const validCard = (overrides: Record<string, unknown> = {}) => ({
  holderName: "John Doe",
  brand: "visa",
  last4: "4242",
  expMonth: 12,
  expYear: new Date().getFullYear() + 1,
  ...overrides,
});

export const addCard = (
  api: APIRequestContext,
  headers: Record<string, string>,
  data: Record<string, unknown>,
) => api.post(ENDPOINTS.CARDS, { headers, data });

export const listCards = (
  api: APIRequestContext,
  headers: Record<string, string>,
) => api.get(ENDPOINTS.CARDS, { headers });

/** A non-existent but well-formed Mongo ObjectId. */
export const FAKE_ID = "64b2f0000000000000000000";

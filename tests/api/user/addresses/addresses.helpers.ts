import type { APIRequestContext } from "@playwright/test";
import { ENDPOINTS } from "../../../constants/endpoints.js";

/** An address payload that passes validation; override fields as needed. */
export const validAddress = (overrides: Record<string, unknown> = {}) => ({
  type: "home",
  label: "My Home",
  addressLine: "123 Rustaveli Avenue",
  lat: 41.7151,
  lng: 44.8271,
  ...overrides,
});

export const addAddress = (
  api: APIRequestContext,
  headers: Record<string, string>,
  data: Record<string, unknown>,
) => api.post(ENDPOINTS.ADDRESSES, { headers, data });

export const listAddresses = (
  api: APIRequestContext,
  headers: Record<string, string>,
) => api.get(ENDPOINTS.ADDRESSES, { headers });

/** A non-existent but well-formed Mongo ObjectId. */
export const FAKE_ID = "64b2f0000000000000000000";

import { APIRequestContext } from "@playwright/test";
import { ENDPOINTS } from "../../../constants/endpoints.js";
import { randomId } from "../../../helpers/utils/generators.js";

export const VALID_TRANSLATION = {
  namespace: "common",
  key: "hello_world",
  translations: {
    ge: "გამარჯობა",
    en: "Hello",
  },
};

export const createTranslation = async (
  adminApi: APIRequestContext,
  overrides?: Record<string, any>,
) => {
  const payload = { ...VALID_TRANSLATION, key: `qa_${randomId()}`, ...overrides };
  const res = await adminApi.post(ENDPOINTS.ADMIN_TRANSLATION, {
    data: payload,
  });
  if (res.status() !== 201) {
    throw new Error(`Failed to create translation. Status: ${res.status()}`);
  }
  const body = await res.json();
  const id = body.data?._id ?? body._id ?? body.translation?._id;
  return { id, payload, res };
};

export const deleteTranslation = async (
  adminApi: APIRequestContext,
  id: string,
) => {
  if (id) {
    await adminApi.delete(`${ENDPOINTS.ADMIN_TRANSLATION}/${id}`);
  }
};

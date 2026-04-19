import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import {
  createTranslation,
  deleteTranslation,
  VALID_TRANSLATION,
} from "../translations.helpers.js";

export const createTranslationSuites = () => {
  test.describe("1. POST /api/admin/translations — Create", () => {
    test("TRN-001: 201 — create with valid fields", async ({ adminApi }) => {
      const uniqueKey = `key_${Date.now()}`;
      const payload = { ...VALID_TRANSLATION, key: uniqueKey };
      const res = await adminApi.post(ENDPOINTS.ADMIN_TRANSLATION, {
        data: payload,
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      const id = body.data?._id ?? body._id ?? body.translation?._id;
      await deleteTranslation(adminApi, id);
    });

    test("TRN-002: 409 — duplicate namespace and key", async ({ adminApi }) => {
      const uniqueKey = `key_dup_${Date.now()}`;
      const { id } = await createTranslation(adminApi, { key: uniqueKey });
      try {
        const payload = { ...VALID_TRANSLATION, key: uniqueKey };
        const res = await adminApi.post(ENDPOINTS.ADMIN_TRANSLATION, {
          data: payload,
        });
        expect(res.status()).toBe(422);
      } finally {
        await deleteTranslation(adminApi, id);
      }
    });

    test("TRN-003: 400 — missing required fields", async ({ adminApi }) => {
      const payload = { ...VALID_TRANSLATION, key: "" }; // empty key
      const res = await adminApi.post(ENDPOINTS.ADMIN_TRANSLATION, {
        data: payload,
      });
      expect(res.status()).toBe(422);
    });
  });
};

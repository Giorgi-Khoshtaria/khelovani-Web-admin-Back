import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import {
  createTranslation,
  deleteTranslation,
  VALID_TRANSLATION,
} from "../translations.helpers.js";

export const updateTranslationSuites = () => {
  test.describe("2. PUT /api/admin/translations/:id — Update", () => {
    test("✅ update georgian/english values", async ({ adminApi }) => {
      const { id, key } = await createTranslation(adminApi);
      const newGe = "განახლებული GE";
      const newEn = "Updated EN";

      const res = await adminApi.put(`${ENDPOINTS.ADMIN_TRANSLATION}/${id}`, {
        data: {
          translations: { ge: newGe, en: newEn },
        },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.translations.ge).toBe(newGe);
      expect(body.data.translations.en).toBe(newEn);

      await deleteTranslation(adminApi, id);
    });

    test("✅ rename translation key successfully", async ({ adminApi }) => {
      const { id } = await createTranslation(adminApi);
      const newKey = `renamed_key_${Date.now()}`;

      const res = await adminApi.put(`${ENDPOINTS.ADMIN_TRANSLATION}/${id}`, {
        data: {
          key: newKey,
        },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.key).toBe(newKey);

      await deleteTranslation(adminApi, id);
    });

    test("❌ failure: rename key to an existing one in same namespace", async ({ adminApi }) => {
      const key1 = `key1_${Date.now()}`;
      const key2 = `key2_${Date.now()}`;
      
      const { id: id1 } = await createTranslation(adminApi, { key: key1 });
      const { id: id2 } = await createTranslation(adminApi, { key: key2 });

      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_TRANSLATION}/${id2}`, {
          data: { key: key1 }, // Try renaming key2 to key1
        });
        
        expect(res.status()).toBe(422);
        const body = await res.json();
        expect(body.message).toContain("არსებობს");
      } finally {
        await deleteTranslation(adminApi, id1);
        await deleteTranslation(adminApi, id2);
      }
    });

    test("❌ failure: update non-existent translation", async ({ adminApi }) => {
      const res = await adminApi.put(`${ENDPOINTS.ADMIN_TRANSLATION}/60f7c2f1f1d1f1d1f1d1f1d1`, {
        data: { translations: { ge: "test", en: "test" } },
      });
      expect(res.status()).toBe(404);
    });
  });
};

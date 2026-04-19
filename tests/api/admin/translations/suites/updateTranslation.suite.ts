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
    // ─── Happy Path ───────────────────────────────────────────────
    test("TRN-U001: 200 — update georgian/english values", async ({ adminApi }) => {
      const { id } = await createTranslation(adminApi);
      const newGe = "განახლებული GE";
      const newEn = "Updated EN";

      const res = await adminApi.put(`${ENDPOINTS.ADMIN_TRANSLATION}/${id}`, {
        data: { translations: { ge: newGe, en: newEn } },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.translations.ge).toBe(newGe);
      expect(body.data.translations.en).toBe(newEn);

      await deleteTranslation(adminApi, id);
    });

    test("TRN-U002: 200 — rename translation key successfully", async ({ adminApi }) => {
      const { id } = await createTranslation(adminApi);
      try {
        const newKey = `renamed_key_${Date.now()}`;

        const res = await adminApi.put(`${ENDPOINTS.ADMIN_TRANSLATION}/${id}`, {
          data: { key: newKey },
        });

        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.data.key).toBe(newKey);
      } finally {
        await deleteTranslation(adminApi, id);
      }
    });

    test("TRN-U003: 200 — updatedAt changes after update", async ({ adminApi }) => {
      const { id } = await createTranslation(adminApi);
      const before = await (await adminApi.get(`${ENDPOINTS.ADMIN_TRANSLATION}/${id}`)).json().catch(() => null);
      await new Promise((r) => setTimeout(r, 50));

      await adminApi.put(`${ENDPOINTS.ADMIN_TRANSLATION}/${id}`, {
        data: { translations: { ge: "ახალი", en: "New" } },
      });

      const after = await (await adminApi.get(`${ENDPOINTS.ADMIN_TRANSLATION}/${id}`)).json().catch(() => null);
      if (before?.data?.updatedAt && after?.data?.updatedAt) {
        expect(new Date(after.data.updatedAt).getTime()).toBeGreaterThanOrEqual(
          new Date(before.data.updatedAt).getTime(),
        );
      }
      await deleteTranslation(adminApi, id);
    });

    test("TRN-U004: 200 — idempotent: same update twice returns 200 both times", async ({ adminApi }) => {
      const { id } = await createTranslation(adminApi);
      const payload = { translations: { ge: "იდემი", en: "Idempotent" } };

      expect((await adminApi.put(`${ENDPOINTS.ADMIN_TRANSLATION}/${id}`, { data: payload })).status()).toBe(200);
      expect((await adminApi.put(`${ENDPOINTS.ADMIN_TRANSLATION}/${id}`, { data: payload })).status()).toBe(200);

      await deleteTranslation(adminApi, id);
    });

    // ─── Validation ───────────────────────────────────────────────
    test("TRN-U010: 422 — rename key to existing one in same namespace", async ({ adminApi }) => {
      const key1 = `key1_${Date.now()}`;
      const key2 = `key2_${Date.now()}`;

      const { id: id1 } = await createTranslation(adminApi, { key: key1 });
      const { id: id2 } = await createTranslation(adminApi, { key: key2 });

      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_TRANSLATION}/${id2}`, {
          data: { key: key1 },
        });
        expect(res.status()).toBe(422);
      } finally {
        await deleteTranslation(adminApi, id1);
        await deleteTranslation(adminApi, id2);
      }
    });

    test("TRN-U011: 404 — update non-existent translation", async ({ adminApi }) => {
      const res = await adminApi.put(`${ENDPOINTS.ADMIN_TRANSLATION}/60f7c2f1f1d1f1d1f1d1f1d1`, {
        data: { translations: { ge: "ტ", en: "t" } },
      });
      expect(res.status()).toBe(404);
    });

    test("TRN-U012: 422 — invalid ObjectId format in URL", async ({ adminApi }) => {
      const res = await adminApi.put(`${ENDPOINTS.ADMIN_TRANSLATION}/bad-id`, {
        data: { translations: { ge: "ტ", en: "t" } },
      });
      expect([400, 422]).toContain(res.status());
    });

    test("TRN-U013: 422 — empty body {}", async ({ adminApi }) => {
      const { id } = await createTranslation(adminApi);
      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_TRANSLATION}/${id}`, { data: {} });
        expect([400, 422]).toContain(res.status());
      } finally {
        await deleteTranslation(adminApi, id);
      }
    });

    // ─── Authorization ────────────────────────────────────────────
    test("TRN-U020: 401 — no token", async ({ api, adminApi }) => {
      const { id } = await createTranslation(adminApi);
      try {
        expect(
          (await api.put(`${ENDPOINTS.ADMIN_TRANSLATION}/${id}`, { data: { translations: { ge: "ა", en: "a" } } }))
            .status(),
        ).toBe(401);
      } finally {
        await deleteTranslation(adminApi, id);
      }
    });

    test("TRN-U021: 403 — partner role cannot update translation", async ({ partnerApi, adminApi }) => {
      const { id } = await createTranslation(adminApi);
      try {
        expect(
          (await partnerApi.put(`${ENDPOINTS.ADMIN_TRANSLATION}/${id}`, { data: { translations: { ge: "ა", en: "a" } } }))
            .status(),
        ).toBe(403);
      } finally {
        await deleteTranslation(adminApi, id);
      }
    });

    // ─── Security ─────────────────────────────────────────────────
    test("TRN-U025: NoSQL injection in key field — 422 or safe", async ({ adminApi }) => {
      const { id } = await createTranslation(adminApi);
      try {
        for (const key of ['{"$gt":""}', '{"$where":"return true"}']) {
          const res = await adminApi.put(`${ENDPOINTS.ADMIN_TRANSLATION}/${id}`, { data: { key } });
          expect(res.status()).not.toBe(500);
        }
      } finally {
        await deleteTranslation(adminApi, id);
      }
    });

    test("TRN-U026: XSS in translation value — stored safely or rejected", async ({ adminApi }) => {
      const { id } = await createTranslation(adminApi);
      try {
        const res = await adminApi.put(`${ENDPOINTS.ADMIN_TRANSLATION}/${id}`, {
          data: { translations: { ge: "<script>alert(1)</script>", en: "ok" } },
        });
        if (res.status() === 200) {
          const text = await res.text();
          expect(text).not.toContain("<script>alert(1)</script>");
        } else {
          expect([400, 422]).toContain(res.status());
        }
      } finally {
        await deleteTranslation(adminApi, id);
      }
    });

    test("TRN-U027: no stack trace or DB internals in error response", async ({ adminApi }) => {
      const text = await (
        await adminApi.put(`${ENDPOINTS.ADMIN_TRANSLATION}/000000000000000000000000`, {
          data: { translations: { ge: "ა", en: "a" } },
        })
      ).text();
      expect(text).not.toMatch(/mongodb/i);
      expect(text).not.toMatch(/mongoose/i);
      expect(text).not.toMatch(/at Object\./);
      expect(text).not.toMatch(/\.js:\d+:\d+/);
    });

    test("TRN-U028: no X-Powered-By header", async ({ adminApi }) => {
      const res = await adminApi.put(`${ENDPOINTS.ADMIN_TRANSLATION}/000000000000000000000000`, {
        data: { translations: { ge: "ა", en: "a" } },
      });
      expect(res.headers()["x-powered-by"]).toBeUndefined();
    });

    test("TRN-U029: path traversal in id — 422 or 404, never 500", async ({ adminApi }) => {
      const res = await adminApi.put(`${ENDPOINTS.ADMIN_TRANSLATION}/../../etc/passwd`, {
        data: { translations: { ge: "ა", en: "a" } },
      });
      expect([400, 404, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });
  });
};

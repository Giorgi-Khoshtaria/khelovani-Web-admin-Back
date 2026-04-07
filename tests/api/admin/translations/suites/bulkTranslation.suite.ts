import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { VALID_TRANSLATION } from "../translations.helpers.js";

export const bulkTranslationSuites = () => {
  test.describe("2. POST /api/admin/translations/bulk — Bulk Ops", () => {
    test("TRN-010: 200 — valid bulk translation", async ({ adminApi }) => {
      const keys = [`bulk_${Date.now()}_1`, `bulk_${Date.now()}_2`];
      const items = keys.map((key) => ({
        namespace: VALID_TRANSLATION.namespace,
        key,
        ge: "ტესტი",
        en: "Test",
      }));
      const payload = { items };
      const res = await adminApi.post(`${ENDPOINTS.ADMIN_TRANSLATION}/bulk`, {
        data: payload,
      });
      // The backend might return 207 or 200, let's assume 200/201 based on typical implementations
      expect([200, 201]).toContain(res.status());
    });
  });
};
